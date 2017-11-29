var i18Host = 'http://localhost:6060';
var apiHost = 'http://216.166.0.49/'; //df-testserver4
//var apiHost = 'http://qamaster.eng.hotschedules.com/';
var staticHost = 'http://localhost:8080/';
var staticOldRedirectHost = 'http://localhost:5000';
var staticRedirectHost = 'http://localhost:6500';
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
                    from: 'scheduling.min.js',
                    to: 'scheduling/config.js'
                },
                {
                    from: 'new-timeoff-approvals.min.master.+.js',
                    to: 'approve-main.js'
                },
                {
                    from: 'new-timeoff-requests.min.master.+.js',
                    to: 'request-config.js'
                },
                {
                    from: 'new-forecast.min.master.+.js',
                    to: 'forecast/forecast.config.js'
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
            exclude: ['hotschedules.js', 'jsp/preload'],
            include: ['.png$|.js$|.cssv$|.woff$|.css$|i18n/resources|.svg$|.jpg$|.gif$|.html$|.ttf|.ico$|.tpl$|.json$|.woff2$']
        },
        dynamic: {
            target: apiHost,
            requestTimeout: 1200000
        }
    }
};
