require('./dns-fix');

var
  http = require('http'),
  httpProxy = require('http-proxy'),
  urlUtils = require('url'),
  config = require('./../hs-proxy.double.config.json'),
  express = require('express'),
  fs = require('fs'),
  staticUrlReplace = config.proxy.static.redirect,
  staticInclude = config.proxy.static.include,
  staticExclude = config.proxy.static.exclude,
  staticRemovePrefix = config.proxy.static.removePrefix;

var staticProxy = httpProxy
  .createProxyServer({
    timeout: config.proxy.static.requestTimeout
  });

staticProxy.on('error', onError);

var dynamicProxy = httpProxy
  .createProxyServer({
    timeout: config.proxy.dynamic.requestTimeout
  });

dynamicProxy.on('error', onError);

http
  .createServer(proxyRequest)
  .listen(config.proxy.port);

function proxyRequest(req, res) {
  var currentUrl = urlUtils.parse(req.url);
  var pathName = currentUrl.path;

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "origin, content-type, accept, x-requested-with, Authorization, X-Scheme, X-CSRFToken");

  if (match(pathName.replace(/[?].+/g, ''), staticInclude) && !match(pathName, staticExclude)) {
    var redirectUrl = redirect(req.url, staticUrlReplace, req.query);

    if (redirectUrl) {
      console.log('proxy redirect ', req.url, '<=>', redirectUrl);

      res.writeHead(302, {
        'Location': redirectUrl
      });

      res.end();
    } else {
      req.url = req.url.replace(new RegExp(staticRemovePrefix), '');
      console.log('proxy static ', pathName, '<=>', req.url);

      staticProxy.web(req, res, {
        target: config.proxy.static.target
      });
    }
  } else {
    console.log('proxy dynamic', req.url, "<=>", config.proxy.dynamic.target + pathName);

    dynamicProxy.web(req, res, {
      target: config.proxy.dynamic.target
    });
  }
}

function match(path, patterns) {
  var result = false;
  patterns = patterns || [];

  for (var i = patterns.length - 1; i >= 0; i--) {
    if (path.match(new RegExp(patterns[i]))) {
      result = patterns[i];
      break;
    }
  }

  return result;
}

function redirect(path, patterns) {
  var result, pattern;
  patterns = patterns || [];

  for (var i = patterns.length - 1; i >= 0; i--) {
    pattern = patterns[i];

    if (path.match(new RegExp(pattern.from))) {
      if (~pattern.to.indexOf('http://')) {
        result = pattern.to + path.replace(pattern.replace ? pattern.replace : '', '/');
      } else {
        result = path.replace(new RegExp(pattern.from), pattern.to);
      }

      break;
    }
  }

  return result;
}

function onError(error) {
  console.error('error', error);
}

console.log('http proxy server has started on port ' + config.proxy.port);
