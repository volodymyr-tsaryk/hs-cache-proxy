require('./dns-fix');

var
    http = require('http'),
    httpProxy = require('http-proxy'),
    urlUtils = require('url'),
    config = require('./../hs-proxy.double.config.json'),
    express = require('express'),
    app = express();

app.use(express.static('client'));
app.listen(3000, function() {
    console.log('server ui has started, port =' + 3000);
});


var staticProxy = httpProxy
    .createProxyServer({
        timeout: config.proxy.static.requestTimeout
    });

var dynamicProxy = httpProxy
    .createProxyServer({
        timeout: config.proxy.dynamic.requestTimeout
    });

http
    .createServer(proxyRequest)
    .listen(config.proxy.port);

function proxyRequest(req, res) {
    var currentUrl = urlUtils.parse(req.url);

    if (include(currentUrl.pathname)) {
        console.log('proxy static', req.url);
        req.url = req.url.replace(/hs\//, '');

        staticProxy.web(req, res, {
            target: config.proxy.static.target
        });
    } else {
        console.log('proxy dynamic', req.url);

        dynamicProxy.web(req, res, {
            target: config.proxy.dynamic.target
        });
    }
}

function include(path) {
    var result = false,
        exclude;

    if (path.match(new RegExp(config.proxy.static.includeExt))) {
        result = true;
        exclude = config.proxy.static.exclude || [];

        for (var i = exclude.length - 1; i >= 0; i--) {
            if (path.match(new RegExp(exclude[i]))) {
                result = false;
                break;
            }
        }
    }

    return result;
}
console.log('http proxy server' + ' started ' + 'on port ' + config.proxy.port);