require('./dns-fix');

var
    http = require('http'),
    httpProxy = require('http-proxy'),
    filendir = require('filendir'),
    fs = require('fs'),
    urlUtils = require('url'),
    config = require('./../hs-proxy.config.json'),
    express = require('express'),
    app = express();

app.use(express.static('client'));
app.listen(3000, function () {
    console.log('server ui has started, port =' + 3000);
});


var proxy = httpProxy
    .createProxyServer({timeout: config.proxy.requestTimeout})
    .on('endBody', storeData);

http
    .createServer(proxyRequest)
    .listen(config.proxy.port);

function proxyRequest(req, res) {
    var key = getKey(req),
        filePath = config.proxy.cachePath + key;

    fs.exists(filePath, function (exists) {

        if (exists) {
            console.log('from cache ', req.url);

            fs.readFile(filePath, 'utf8', function (err, data) {
                var json = JSON.parse(data);

                if (err) {
                    return console.error(err);
                }

                Object.keys(json.headers).forEach(function (key) {
                    res.setHeader(key, json.headers[key]);
                });

                res.statusCode = json.httpStatus;

                if (json.latency) {
                    setTimeout(function () {
                        res.end(toData(res, json.body));
                    }, json.latency);
                } else {
                    res.end(toData(res, json.body));
                }

            });
        } else {
            console.log('proxy ', req.url);

            proxy.web(req, res, {
                target: config.proxy.target
            });
        }
    });
}

function storeData(req, res, proxyRes, body) {
    var url = getKey(req),
        filePath = config.proxy.cachePath + url,
        currentUrl = urlUtils.parse(req.url);

    fs.exists(filePath, function (exists) {
        if (!currentUrl.pathname.match(new RegExp(config.proxy.excludeExt)) && !exists) {
            var data = getData(proxyRes, body);

            filendir.writeFile(filePath, JSON.stringify({
                    headers: proxyRes.headers,
                    httpStatus: res.statusCode,
                    body: data
                }, null, '\t'),
                function (err) {
                    if (err) {
                        return console.error(err);
                    }
                });
        }
    });
}

function toData(res, body) {
    var contentType = res.getHeader('content-type') || '';

    if (contentType.startsWith('application/json')) {
        return JSON.stringify(body);
    } else {
        return String(body);
    }
}

function getData(res, body) {
    if (res.headers && (res.headers['content-type'] || '').startsWith('application/json')) {
        return JSON.parse(body);
    } else {
        return body;
    }
}

function getKey(req) {
    var cleaners = config.url.cleaners || [], url = req.url;

    cleaners.forEach(function (cleaner) {
        url = url.replace(new RegExp(cleaner, 'gi'), '');
    });

    return url;
}

console.log('http proxy server' + ' started ' + 'on port ' + config.proxy.port);
