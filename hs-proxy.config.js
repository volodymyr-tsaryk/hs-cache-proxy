var i18Host = 'http://localhost:6060';
//var apiHost = 'http://216.166.0.49/'; //df-testserver4
var apiHost = 'http://qamaster.eng.hotschedules.com/';
//var apiHost = 'http://qareleased.eng.hotschedules.com/';
//var apiHost = 'http://beta2.hotschedules.com/';
var staticHost = 'http://localhost:8080/';
var staticOldRedirectHost = 'http://localhost:5000';
var staticRedirectHost = 'http://localhost:6500';
var dist16RedirectHost = 'http://localhost:6501';

var bundleHashesToDevReplace = [
    '/',
    {
        from: new RegExp('bundle[.].{1,}[.]js'),
        to: 'bundle.dev.js'
    }
];

module.exports = {
    proxy: {
        port: 8003,
        static: {
            target: staticHost,
            removePrefix: 'hs',
            requestTimeout: 1200000,
            redirect: [
                {
                    from: 'hs/backbone/*.*',
                    replace: '/',
                    to: staticRedirectHost
                },
                {
                    from: 'templates/green/js/scheduling.min.js',
                    to: 'backbone/scheduling/config.development.js'
                },
                {
                    from: 'templates/green/js/rosterReport.min.js',
                    to: 'backbone/report/config.development.js'
                },
                {
                    from: 'templates/default/js/newTimeOff/new-timeoff-approvals.min.master.+.js',
                    to: 'backbone/newTimeOff/approve/approve-main.dev.js'
                },
                {
                    from: 'templates/default/js/newTimeOff/new-timeoff-requests.min.master.+.js',
                    to: 'backbone/newTimeOff/request/request-config.dev.js'
                },
                {
                    from: 'templates/green/js/new-forecast.min.master.+.js',
                    to: 'backbone/forecast/forecast.dev.config.js'
                },
                {
                    from: 'startup-page.min.js',
                    to: 'login/config.js'
                },                
                {
                    from: '.*update.js$',
                    replace: '/',
                    to: staticRedirectHost
                },
                {
                    from: '.*update.json$',
                    replace: '/',
                    to: staticRedirectHost
                },
                {
                    from: '/apps/.*[.js|.css|.json|.woff2|.woff|.ttf]',
                    replace: bundleHashesToDevReplace,
                    to: staticRedirectHost
                },
                {
                    from: '/apps/dist/modules/.*[.js|.css|.json|.woff2|.woff|.ttf]',
                    to: staticRedirectHost,
                    replace: bundleHashesToDevReplace,
                },
                {
                    from: "/apps/dist16.*[.js|.css|.json|.woff2|.woff|.ttf]",
                    replace: bundleHashesToDevReplace,
                    to: dist16RedirectHost
                },
                {
                    from: '/apps/dist/vendor/.*[.js|.css|.json|.woff2|.woff|.ttf]',
                    to: staticRedirectHost,
                    replace: bundleHashesToDevReplace,
                },
                {
                    from: '/apps/dist/module-launcher/.*[.js|.css|.json|.woff2|.woff|.ttf]',
                    to: staticRedirectHost,
                    replace: bundleHashesToDevReplace,
                },
                {
                    from: '/templates/green/js/logbook/.*[.js|.css|.json|.woff2|.woff|.ttf]',
                    replace: bundleHashesToDevReplace,
                    to: staticOldRedirectHost
                },
                {
                    from: '/apps/dist/punch-records/.*[.js|.css|.json|.woff2|.woff|.ttf]',
                    replace: bundleHashesToDevReplace,
                    to: staticOldRedirectHost
                },
                {
                    from: '/spring/i18n/resources',
                    replace: '/',
                    to: i18Host
                }
            ],
            exclude: ['hotschedules.js', 'hotschedules.css', 'jsp/preload'],
            include: ['.png$|.js$|.cssv$|.woff$|.css$|i18n/resources|.svg$|.jpg$|.gif$|.html$|.ttf|.ico$|.tpl$|.json$|.woff2$']
        },
        dynamic: {
            target: apiHost,
            requestTimeout: 1200000
        }
    }
};
