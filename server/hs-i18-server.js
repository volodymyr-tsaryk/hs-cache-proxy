var
  config = require('./../hs.i18.config.js'),
  express = require('express'),
  properties = require('properties');

var server = express();

server.all('/*', function(req, res, next) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept, x-requested-with, Authorization, X-Scheme, X-CSRFToken, X-XSRF-TOKEN');
  next();
});

server.get('/hs/spring/i18n/resources', function(req, res) {
  var bundle = req.query.bundle;

  if (bundle) {
    var bundlePath = config.resourcesRoot + bundle.replace(/[.]/g, '/') + config.suffix + '.properties';

    properties.parse(bundlePath, {
        path: true
      },
      function read(err, data) {

        if (err) {
          console.log(err);
          res.status(500).end();
        } else {
          res.send(data);
        }
      });
  } else {
    res.status(404).end();
  }
});

server.listen(config.port, function() {
  console.log('http i18 server has been started on port ' + config.port);
});
