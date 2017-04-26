var i18Host = 'http://localhost:6060';
var apiHost = 'http://df-testserver4/';
//var apiHost = 'http://10.1.19.12/';
var staticHost = 'http://localhost:8080/';
var staticRedirectHost = 'http://localhost:5000';

module.exports = {
  'proxy': {
    'port': 8003,
    'static': {
      'target': staticHost,
      'removePrefix': 'hs',
      'requestTimeout': 1200000,
      'redirect': [{
          'from': 'scheduling.min.js',
          'to': 'scheduling/config.js'
        }, {
          'from': 'new-timeoff-approvals.min.master.+.js',
          'to': 'approve-main.js'
        },
        {
          'from': 'new-forecast.min.master.+.js',
          'to': 'forecast/forecast.config.js'
        }, {
          'from': '.*update.js$',
          'replace': '/',
          'to': staticRedirectHost
        }, {
          'from': '.*update.json$',
          'replace': '/',
          'to': staticRedirectHost
        }, {
          'from': '\/apps\/.*[.js|.css|.json|.woff2|.woff|.ttf]',
          'replace': ['/', {
            from: new RegExp('bundle[.].{1,}[.]js'),
            to: 'bundle.dev.js'
          }],
          'to': staticRedirectHost
        }, {
          'from': '\/templates\/green\/js\/logbook\/.*[.js|.css|.json|.woff2|.woff|.ttf]',
          'replace': '\/templates\/green\/js\/logbook\/dist\/',
          'to': staticRedirectHost
        }, {
          'from': '\/spring\/i18n\/resources',
          'replace': '\/',
          'to': i18Host
        }
      ],
      'exclude': [
        'hotschedules.js',
        'jsp/preload'
      ],
      'include': [
        '.png$|.js$|.cssv$|.woff$|.css$|i18n\/resources|.svg$|.jpg$|.gif$|.html$|.ttf|.ico$|.tpl$|.json$|.woff2$'
      ]
    },
    'dynamic': {
      'target': apiHost,
      'requestTimeout': 1200000
    }
  }
}