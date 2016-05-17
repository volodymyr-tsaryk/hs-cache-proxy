require('./dns-fix');

var
    http = require('http'),
    httpProxy = require('http-proxy'),
    urlUtils = require('url'),
    config = require('./../hs-proxy.double.config.json'),
    express = require('express'),
    app = express(),
    staticUrlReplace = config.proxy.static.redirect,
    staticInclude = config.proxy.static.include,
    staticExclude = config.proxy.static.exclude,
    staticRemovePrefix = config.proxy.static.removePrefix;

app.use(express.static('client'));

app.listen(config.proxy.uiPort, function () {
    console.log('server ui has started, port = ' + config.proxy.uiPort);
});

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
    var currentUrl = urlUtils.parse(req.url), pathName = currentUrl.pathname;

    if (match(pathName, staticInclude) && !match(pathName, staticExclude)) {
        var redirectUrl = redirect(req.url, staticUrlReplace);

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
            result = true;
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
            result = path.replace(new RegExp(pattern.from), pattern.to);

            break;
        }
    }

    return result;
}

function onError(error) {
    console.error('error', error);
}

console.log('http proxy server has started on port ' + config.proxy.port);
