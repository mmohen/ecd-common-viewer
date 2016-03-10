// Karma configuration
// Generated on Tue Feb 10 2015 18:49:37 GMT+0530 (India Standard Time)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'app/js/libs/bower/pdfjs-dist/build/pdf.js',
            'app/js/libs/bower/pdfjs-dist/build/pdf.worker.js',
            'app/js/libs/bower/webL10n/l10n.js',
            'app/js/libs/bower/es6-promise/promise.js',
            'app/js/libs/bower/eventEmitter/EventEmitter.js',
            'app/js/libs/bower/doT/doT.js',
            'app/js/libs/bower/jqlite/jqlite.1.1.1.js',
            'app/js/libs/bower/jclass/index.js',            

            'dist/*.js',

            'dist/*.css',

            'test/**/*.js',

            /*{pattern: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css', 
                watched: false, included: true, served: true },  */          

            {pattern: 'app/templates/*.html', watched: true, included: false, served: true },

            {pattern: 'app/js/download/downloader.js', watched: true, included: false, served: true}

        ],       


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,

        //proxy
        proxies: {
            '/test-data/': 'http://localhost:9001/'
        },       


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
