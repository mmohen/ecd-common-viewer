/**
 * start up functions
 * - initializing namespace;
 * polyfills;
 * utilities;
 * load jqlite if necessary (if it or jquery not already present)
 */
//initialize namespace
var emc = emc === undefined ? {} : emc;
emc.content = emc.content || {};
emc.content.viewer = emc.content.viewer || {};

var viewerNS = emc.content.viewer;

//Polyfills

/**
 * String endsWith polyfill
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
 *
 * This method has been added to the ECMAScript 6 specification
 * and may not be available in all JavaScript implementations yet.
 * However, you can polyfill String.prototype.endsWith() with the following snippet
 *
 */
if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        value: function(searchString, position) {
            var subjectString = this.toString();
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

/*\
 |*|
 |*|  :: Number.isInteger() polyfill ::
 |*|
 |*|  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 |*|
 \*/

if (!Number.isInteger) {
    Number.isInteger = function isInteger(nVal) {
        return typeof nVal === 'number'
            && isFinite(nVal)
            && nVal > -9007199254740992
            && nVal < 9007199254740992
            && Math.floor(nVal) === nVal;
    };
}

//Utility functions

viewerNS.Util = {};

/**
 * initializeConfig for an object
 * @param config json config data
 * @param object
 */
viewerNS.Util.initializeConfig = function(config, object){
    var configParam;
    for(configParam in config){
        object[configParam] = config[configParam];
    }
};

/**
 * Logger
 */
viewerNS.Util.Logger = (function () {
    var WARN = "WARNING";
    var DEBUG = "DEBUG";
    var LOG = "LOG";

    this.log = function(msg) {
        return console.log(setViewerPrefix(msg, LOG));
    };

    this.debug = function(msg) {
        return console.log(setViewerPrefix(msg, DEBUG));
    };

    this.warn = function(msg) {
        return console.log(setViewerPrefix(msg, WARN));
    };

    function setViewerPrefix(msg, level) {
        var date, formatedTimeStamp;
        date = (new Date()).getTime().toString();
        formatedTimeStamp = date.substring(8, 13);//date
        return formatedTimeStamp + ": " + "Viewer " + level + ": " + msg;
    }

    return this;
}());

/**
 * convertRelToAbsUrl
 *
 * http://stackoverflow.com/a/7544757/1983903
 *
 * @param  {String} url
 * @return {String} updated url
 */
viewerNS.Util.convertRelToAbsUrl = function(url) {

    var baseUrl = location.href.match(/^(.+)\/?(?:#.+)?$/)[0];
    baseUrl.concat( baseUrl.endsWith("/") ? "" : "/");

    if (!url) {
        return baseUrl;
    }
    /* Only accept commonly trusted protocols:
     * Only data-image URLs are accepted, Exotic flavours (escaped slash,
     * html-entitied characters) are not supported to keep the function fast */
    if(/^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url)) {
        return url;
    } //Url is already absolute


    if(url.substring(0,2) == "//") {
        if (/^[a-z][a-z0-9+\-.]*:/i.test(url)) {
            return url;
        }
    }
    var i;
    if (url.charAt(0) === '/') {
        // absolute path
        i = baseUrl.indexOf('://');
        if (url.charAt(1) === '/') {
            ++i;
        } else {
            i = baseUrl.indexOf('/', i + 3);
        }
        return baseUrl.substring(0, i) + url;
    } else {
        // relative path
        var pathLength = baseUrl.length;
        i = baseUrl.lastIndexOf('#');
        pathLength = i >= 0 ? i : pathLength;
        i = baseUrl.lastIndexOf('?', pathLength);
        pathLength = i >= 0 ? i : pathLength;
        var prefixLength = baseUrl.lastIndexOf('/', pathLength);
        return baseUrl.substring(0, prefixLength + 1) + url;
    }

};

viewerNS.Util.loadJsLibrary = function (scriptPath, checkLibraryFn) {
    if(!scriptPath || checkLibraryFn){
        return;
    }
    var head = document.getElementsByTagName('head')[0];
    var js = document.createElement("script");

    js.type = "text/javascript";
    js.src = scriptPath;
    head.appendChild(js);
};

viewerNS.Util.loadJsLibrary("app/js/libs/bower/jqlite/jqlite.1.1.1.js", window.jQuery);
