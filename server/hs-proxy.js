require('./dns-fix');

var fs = require('fs'),
    http = require('http'),
    urlUtils = require('url'),
    express = require('express'),
    httpProxy = require('http-proxy'),
    config = require('./../hs-proxy.config.js'),
    staticUrlReplace = config.proxy.static.redirect,
    staticInclude = config.proxy.static.include,
    staticExclude = config.proxy.static.exclude,
    staticRemovePrefix = config.proxy.static.removePrefix;

var redirectHostString = '//localhost/hs/';

var staticProxy = httpProxy.createProxyServer({
    timeout: config.proxy.static.requestTimeout
});

staticProxy.on('error', onError);

var dynamicProxy = httpProxy.createProxyServer({
    timeout: config.proxy.dynamic.requestTimeout
});

dynamicProxy.on('error', onError);

dynamicProxy.on('proxyRes', function (proxyRes, req, res) {
    if (proxyRes.statusCode === 302 && proxyRes.headers && proxyRes.headers.location.indexOf(redirectHostString) !== -1) {
        var newLocation = proxyRes.headers.location.replace(redirectHostString, '//localhost:'+ config.proxy.port +'/hs/');
        proxyRes.headers['location'] = newLocation;
    }
});



http.createServer(proxyRequest).listen(config.proxy.port);

function proxyRequest(req, res) {
    var currentUrl = urlUtils.parse(req.url);
    var pathName = currentUrl.path;

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept, x-requested-with, Authorization, X-Scheme, X-CSRFToken');

    if (match(pathName.replace(/[?].+/g, ''), staticInclude) && !match(pathName, staticExclude)) {
        var redirectUrl = redirect(req.url, staticUrlReplace, req.query);

        if (redirectUrl) {
            console.log('proxy redirect ', req.url, '<=>', redirectUrl);

            res.writeHead(302, {
                Location: redirectUrl
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
        console.log('proxy dynamic', req.url, '<=>', config.proxy.dynamic.target + pathName);

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
                result = pattern.to + '/' + replace(pattern.replace, path);
            } else {
                result = path.replace(new RegExp(pattern.from), pattern.to);
            }

            break;
        }
    }

    return result;
}

function replace(replace, path) {
    var result = path;

    if (Array.isArray(replace)) {
        replace.forEach(function(item) {
            if (typeof item === 'string') {
                result = result.replace(item, '');
            } else if (typeof item === 'object') {
                result = result.replace(item.from, item.to);
            }
        });
    } else if (replace) {
        result = result.replace(replace, '');
    }

    return result;
}

function onError(error) {
    console.error('error', error);
}

console.log('http proxy server has been started on port ' + config.proxy.port);
