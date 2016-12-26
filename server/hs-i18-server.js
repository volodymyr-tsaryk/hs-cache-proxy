var
  config = require('./../hs.i18.config.js'),
  express = require('express'),
  properties = require('properties');

var server = express();

server.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
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
