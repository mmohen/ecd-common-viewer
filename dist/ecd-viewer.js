/**
 * Created by Michad on 10/27/2014.
 */

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

/**
 * Created by Michad on 1/23/2015.
 */

/**
 * Template manager class
 */
viewerNS.Util.TemplateManager = (function () {

    var defaultTemplateHandler;
    var templateHandler;
    templateHandler = defaultTemplateHandler = doT;

    this.compile = function(templateString, templateSettings, data) {
        return templateHandler.template(templateString, templateSettings, data);
    };

    this.overrideTemplateHandler = function(templateEngine) {
        templateHandler = templateEngine;
    };

    return this;
}());
/**
 * Dom functions utility class
 */
viewerNS.Util.DomUtility = (function () {

    this.documentReady = function(fn){
        $(document).ready(fn);
    };

    this.append = function(elem, html) {
        var element = this.getElement(elem);
        element.append(html);
    };

    this.getElement = function (elem, firstElement) {
        var element;
        if(typeof elem === 'string'){
            element = $("#" + elem);
        }
        else if(typeof elem === 'object'){
            if (elem.jquery) {
                element = elem;
            }
            else {
                element = $(elem);

            }
        }
        if (firstElement && element && element.length > 0) {
            element = element[0];
        }
        return element;
    };

    this.getBodyElement = function() {
        return $("body");
    };

    this.applyStyles = function(elem, jsonData) {
        this.getElement(elem).css(jsonData);
    };

    this.getWidth = function(elem) {
        var element;
        if(elem.length && elem.length > 0 ){
            element = elem[0];
        }
        return element.clientWidth;
    };

    function getDomElement(elem) {
        var element;
        if (elem.length && elem.length > 0) {
            element = elem[0];
        }
        return element;
    }

    this.getHeight = function(elem) {
        var element = getDomElement(elem);
        return element.clientHeight;
    };

    this.getScrollTop = function(elem) {
        var element = getDomElement(elem);
        return element.scrollTop;
    };

    this.setScrollTop = function(elem, value) {
        var element = getDomElement(elem);
        return element.scrollTop = value;
    };

    this.getScrollHeight = function(elem) {
        var element = getDomElement(elem);
        return element.scrollHeight;
    };

    this.ajaxRequest = function(url, params, callback){
        $.ajax.send(url, params, callback);
    };

    this.jqw = $;

    var NonWhitespaceRegexp = /\S/;

    this.isAllWhitespace = function(str) {
        return !NonWhitespaceRegexp.test(str);
    };

    this.clone = function(object, deep) {
        if(deep){
            return $.extend(true, {}, object);
        }
        else {
            return $.extend({}, object);
        }
        return !NonWhitespaceRegexp.test(str);
    };

    this.merge = function(obj1, obj2) {
        return $.extend({}, obj1, obj2);
    };

    return this;
}());

/**
 * Delayed task runner
 */
viewerNS.DelayedTask = JClass._extend({
    init: function(fn, scope, args, cancelOnDelay) {
        var me = this,
            delay,
            call = function() {
                clearInterval(me.id);
                me.id = null;
                fn.apply(scope, args || []);
            };

        cancelOnDelay = typeof cancelOnDelay === 'boolean' ? cancelOnDelay : true;

        me.delay = function(newDelay, newFn, newScope, newArgs) {
            if (cancelOnDelay) {
                me.cancel();
            }
            delay = newDelay || delay;
            fn = newFn || fn;
            scope = newScope || scope;
            args  = newArgs  || args;
            if (!me.id) {
                me.id = setInterval(call, delay);
            }
        };

        /**
         * Cancel the last queued timeout
         */
        me.cancel = function() {
            if (me.id) {
                clearInterval(me.id);
                me.id = null;
            }
        };
    }
});

/**
 * Store for records
 * WIP - adding functions as needed
 */
viewerNS.Store = JClass._extend({

    init: function(config){
        var data = config.data || this.data;
        this.storeId = config.storeId;
        this.initData(data);
        this.length = this.data.length;
    },

    initData: function (data) {
        this.data = [];
        if(this.isArrayType(data)) {
            this.addRecordsFromData(data);
        }
    },

    addRecordsFromData: function(objectData) {
        for (var i = 0; i < objectData.length; i++) {
            this.add(objectData[i]);
        }
    },

    isArrayType: function(object) {
        return !!(object && Object.prototype.toString.call(object) === '[object Array]');

    },

    getAt: function(index){
        return this.data.length > index ? this.data[index] : null;
    },

    getCount: function() {
        return this.data.length;
    },

    getRange: function(start, end){
        var extendedEnd = parseInt(end) + 1;
        return this.data.slice(start, extendedEnd);
    },

    each: function(fn, scope) {
        var data = this.data,
            dLen = data.length,
            record, d;

        for (d = 0; d < dLen; d++) {
            record = data[d];
            if (fn.call(scope || record, record, d, dLen) === false) {
                break;
            }
        }
    },

    add: function(item){
        this.data.push(new viewerNS.StoreRecord( item ));
    },

    clear: function() {
        while(this.data.length > 0) {
            this.data.pop();
        }
    }
});

/**
 * Store records
 */
viewerNS.StoreRecord = JClass._extend({
    init: function(config) {
        viewerNS.Util.initializeConfig(config, this);
    },

    get: function(propertyName){
        return this[propertyName];
    },

    set: function(propertyName, data) {
        this[propertyName] = data;
    }
});

viewerNS.ArrayStore = viewerNS.Store._extend({
    init: function init(config){
        var fields = config.fields || this.fields;
        this.fields = this.isArrayType(fields) ? fields : [];
        //call parent
        init._super.call(this, config);
    }
});
/**
 * Created by Michad on 1/19/2015.
 */
viewerNS.ViewerStore = viewerNS.ArrayStore._extend({
    DOWNLOADED: "downloaded",
    PARTIAL_DOWNLOADED: "partialDownloaded",
    NOT_DOWNLOADED: "notDownloaded",
    REQUEST_RENDER: "requestRender",
    REQUEST_PARTIAL_RENDER: "requestPartialRender",
    RENDERED: "renderingComplete",
    RENDERING: "rendering",
    PARTIAL_RENDERED: "partialRendered",
    NOT_RENDERED: "notRendered",

    fields: ['pageId', 'pageRef', 'heightOrig', 'widthOrig', 'zoom', 'rotate', 'renderingStatus', 'thumbRenderingStatus',
        'zoomedHeight', 'zoomedWidth', 'textContent', 'pageSnapshot', 'annotation', 'downloadStatus'],

    init: function init(config){
        //call parent
        init._super.call(this, config);
    }

});
/**
 * Created by Michad on 1/16/2015.
 */

if(viewerNS){
    viewerNS.Downloader = JClass._extend({

        DOWNLOADER_PATH: 'app/js/download/downloader.js', //can be overridden by consuming app in config param 'downloaderPath'        

        init: function(config) {
            this.downloaderPath = this.DOWNLOADER_PATH; //will get overriden with the value from the config if present
            viewerNS.Util.initializeConfig(config, this);
            this.id = this.uniqueId();
            return this.registerListeners();
        },

        registerListeners: function() {
            this.eventBus.addListener('downloadFullContent', this.downloadFullContent.bind(this));
            return this.eventBus.addListener('downloadPages', this.downloadPage.bind(this));
        },

        downloadFullContent: function(docUrls) {
            if (typeof Worker === void 0) {
                this.log('Downloading doc in non-worker mode');
                return this.downloadFullInNonWorker(docUrls);
            } else {
                return this.downloadWithWorker(docUrls);
            }
        },
        downloadWithWorker: function(docUrls) {
            this.mainWorker = new Worker(this.downloaderPath);
            this.mainWorker.onmessage = (function(_this) {
                return function(e) {
                    var result;
                    result = e.data;
                    switch (result.response) {
                        case 'downloadProgress':
                            return _this.handleDownloadProgress(result.loaded, result.total);
                        case 'docDownloaded':
                            return _this.handleDownloadedDoc(result.content);
                        case 'log':
                            return _this.log(result.msg);
                        case 'downloadError':
                            return _this.handleDownloadError(result.error);
                        default:
                            return _this.log(result);
                    }
                };
            })(this);
            return this.mainWorker.postMessage({
                'action': 'download',
                'primaryUrl': docUrls.fullDocumentUrl,
                'fallbackUrl': docUrls.fallbackUrl,
                page: ""
            });            
        },
        handleDownloadedDoc: function(data) {
            this.log("Downloaded document");
            if(this.isArrayBuffer(data)){
                data.length = data.byteLength;
            }
            return this.eventBus.emitEvent(this.viewerId + 'entireDocDownloaded', [data]);
        },
        handleDownloadProgress: function(current, total) {
            this.log("Downloaded " + current + " of " + total);
            return this.eventBus.emitEvent('progressUpdate', [current, total]);
        },
        handleDownloadError: function(error) {
            return this.log("Error occurred on document download: " + error);
        },
        isArrayBuffer: function (data) {
            return typeof data === 'object' && data !== null && data.byteLength !== undefined;
        },

        downloadPage: function(pageServingUrl, range) {
            var downloader, page;
            downloader = new Worker(this.downloaderPath);
            page = "" + range.start + "-" + range.end;
            downloader.onmessage = (function(_this) {
                return function(e) {
                    var result;
                    result = e.data;
                    switch (result.response) {
                        case 'downloadProgress':
                            return _this.handlePageDownloadProgress(result.pageRange, result.loaded, result.total);
                        case 'docDownloaded':
                            _this.handleDownloadedPage(result.pageRange, result.content);
                            downloader.terminate();
                            return downloader.onmessage = null;
                        case 'log':
                            return _this.log("Pages(" + result.pageRange.start + " - " + result.pageRange.end + ") downloader log:" + result.msg);
                        case 'downloadError':
                            _this.handlePageDownloadError(result.pageRange, result.error);
                            downloader.terminate();
                            return downloader.onmessage = null;
                        default:
                            return _this.log(result);
                    }
                };
            })(this);
            return downloader.postMessage({
                'action': 'download',
                'primaryUrl': this.getPageRangeUrl(pageServingUrl, range.start, range.end),
                'fallbackUrl': "",
                'pageRange': range
            });
        },
        downloadFullInNonWorker: function(docUrls) {
            this.fallBackDownloader = new xcp.viewer.controller.FallBackDownloader();
            this.registerFallBackListeners();
            return this.fallBackDownloader.download(docUrls.fullDocumentUrl, docUrls.fallbackUrl);
        },
        registerFallBackListeners: function() {
            this.fallBackDownloader.addListener('downloadProgressNonWorker', this.handlePageDownloadProgress);
            this.fallBackDownloader.addListener('docDownloadedNonWorker', this.handleDownloadedDoc);
            return this.fallBackDownloader.addListener('downloadErrorNonWorker', this.handleDownloadError);
        },
        handleDownloadedPage: function(pageRange, data) {
            this.log("Downloaded Pages(" + pageRange.start + " - " + pageRange.end + ")");
            return this.eventBus.emitEvent(this.viewerId + 'pageDownloaded', [pageRange, data]);
        },
        handlePageDownloadProgress: function(pageRange, current, total) {
            this.log("Downloader, Pages(" + pageRange.start + " - " + pageRange.end + ") progressed " + current + " of " + total);
            return this.eventBus.emitEvent('progressUpdate', [current, total]);
        },
        handlePageDownloadError: function(pageRange, error) {
            return this.log("Downloader, Error occurred on pages(" + pageRange.start + " - " + pageRange.end + ") download: " + error);
        },
        getPageRangeUrl: function(pageServingUrl, start, end) {
            if (pageServingUrl) {
                return pageServingUrl + ("&startpage=" + start + "&endpage=" + end);
            } else {
                return "";
            }
        },
        log: function(msg) {
            return viewerNS.Util.Logger.log(msg);
        },

        uniqueId: function() {
            var date, formatedTimeStamp;
            date = (new Date()).getTime().toString();
            return date.substring(8, 13);            

        }



    });

}
/**
 * Created by Michad on 1/16/2015.
 */

if(viewerNS){
    viewerNS.MainController = JClass._extend({
        THUMBNAIL_SCALE: 0.16,
        THUMBNAIL_WIDTH: 98,
        THUMBNAIL_HEIGHT: 126,
        CSS_UNITS: 96.0 / 72.0,
        zoomScale: 1 * (96.0 / 72.0),
        lastScrollY: 0,
        trailingBufferZone: 2,
        pageSetSize: 2,
        TEXT_LAYER_RENDER_DELAY : 200, // ms
        firstPageProcessedWithRange: false,
        firstPageInStoreReady: false,
        haveCompleteDocumentInStore: false,
        ACTUAL_SIZE_SCALE: 'actualSizeScale',
        FIT_TO_WIDTH: 'fitToWidth',
        FIT_TO_HEIGHT: 'fitToHeight',
        FIT_TO_PAGE: 'fitToPage',
        PAGE_RENDER_COMPLETE: 'docPageRendered',
        PDFJS_WORKER_PATH: 'app/js/libs/bower/pdfjs-dist/build/pdf.worker.js', //can be overridden by consuming app in config param 'pdfJsWorkerPath'

        init: function(config, eventBus, pageView) {
            this.pdfJsWorkerPath = this.PDFJS_WORKER_PATH; //will get overriden with the value from the config if present
            viewerNS.Util.initializeConfig(config, this);
            this.docUrls = this.extractUrlConfig(config);
            this.eventBus = eventBus;
            this.pageView = pageView;
            this.initDownloader();
            this.initializeStore();
            this.enablePDFJSWorkerThread();
            this.registerListeners();
        },

        initDownloader: function() {
            this.downloader = new viewerNS.Downloader({
                viewerId: this.viewerId,
                totalPageCount: this.totalPageCount,
                eventBus: this.eventBus,
                downloaderPath: this.downloaderPath
            });
        },

        initializeStore: function() {
            this.pageStore = new viewerNS.ViewerStore({
                storeId: "" + this.viewerId + "-pageStore"
            });
        },

        registerListeners: function () {
            this.eventBus.addListener(this.viewerId + 'pageDownloaded', this.handlePageDownload.bind(this));
            this.eventBus.addListener(this.viewerId + 'entireDocDownloaded', this.entireDocDownloaded.bind(this));

            this.eventBus.addListener(this.viewerId + 'viewScroll', this.manageViewScroll.bind(this));
            this.eventBus.addListener(this.viewerId + 'viewScroll', this.onViewScrolled.bind(this));
            this.eventBus.addListener(this.viewerId + 'thumbChange', this.manageThumbChange.bind(this));

            this.eventBus.addListener(this.viewerId + 'navigationRequest', this.navigateToPage.bind(this));
            this.eventBus.addListener(this.viewerId + 'fitToWidthRequest', this.fitToWidth.bind(this));
            this.eventBus.addListener(this.viewerId + 'fitToHeightRequest', this.fitToHeight.bind(this));
            this.eventBus.addListener(this.viewerId + 'actualSizeScaleRequest', this.actualSizeFit.bind(this));
            this.eventBus.addListener(this.viewerId + 'fullScreenRequest', this.onFullScreenRequest.bind(this));
            this.eventBus.addListener(this.viewerId + 'zoomRequest', this.zoom.bind(this));
            this.eventBus.addListener(this.viewerId + 'printDocRequest', this.onPrintRequest.bind(this));
            this.eventBus.addListener(this.viewerId + 'openFileRequest', this.onOpenFileRequest.bind(this));
            
            this.eventBus.addListener(this.viewerId + 'destroy', this.destroy.bind(this));

            this.attachFullscreenListener();

            //this.delayedSetupAllViewTask = new viewerNS.DelayedTask(this.setupAllView, this, [this.pageView]);
            //this.delayedFitByConfigTask = new viewerNS.DelayedTask(this.fitByConfig, this);
        },

        setSearchController: function( controller ) {
            this.searchController = controller;
        },

        setThumbnailController: function (controller) {
            this.thumbnailController = controller;
        },

        loadDocument: function (urls) {
            if(urls){
                this.docUrls = this.extractUrlConfig(urls);
            }
            if(this.hasUrlToLoad(this.docUrls)){
                this.loadPdf();                
            }
        },

        extractUrlConfig: function(config) {
            var result = {};
            if(config){
                result = {
                    fullDocumentUrl: config.fullDocumentUrl,
                    pageServingUrl: config.pageServingUrl,
                    fallbackUrl: config.fallbackUrl
                };
            }
            return result;
        },

        hasUrlToLoad: function(docUrls) {
            //TODO more stringent checks?
            return docUrls.fullDocumentUrl || docUrls.pageServingUrl || docUrls.fallbackUrl;
        },

        getPageSet: function (pageIndex) {
            var end, offsetFromPageSet, start;
            offsetFromPageSet = pageIndex % this.pageSetSize;
            start = pageIndex - offsetFromPageSet + 1;
            end = start + this.pageSetSize - 1;
            return {
                start: start,
                end: end
            };
        },

        requestRendering: function(page) {
            var renderingStatus;
            renderingStatus = page.get('renderingStatus');
            if (renderingStatus === this.pageStore.NOT_RENDERED) {
                return page.set('renderingStatus', this.pageStore.REQUEST_RENDER);
            }
        },
        loadPdf: function () {
            if(this.totalPageCount){
                this.createPageStoreEntries();
            }
            if(this.pageServingUrl){
                this.eventBus.emitEvent('downloadPages', [this.docUrls.pageServingUrl, this.getPageSet(1)]);
            }
            this.eventBus.emitEvent('downloadFullContent', [this.docUrls]);
        },
        createPageStoreEntries: function (downloaded) {
            var pageIndex;
            for (pageIndex = 0; pageIndex < this.totalPageCount; pageIndex++) {
                this.createPageStoreRecord(pageIndex, downloaded);
            }
        },
        createPageStoreRecord: function(pageIndex, downloaded) {
            var downloadStatus = downloaded ? this.pageStore.DOWNLOADED : this.pageStore.NOT_DOWNLOADED;
            return this.pageStore.add({
                pageId: pageIndex,
                renderingStatus: this.pageStore.NOT_RENDERED,
                thumbRenderingStatus: this.pageStore.NOT_RENDERED,
                downloadStatus: downloadStatus
            });
        },
        enablePDFJSWorkerThread: function() {
            PDFJS.workerSrc = this.pdfJsWorkerPath;
            return PDFJS.disableWorker = false;
        },
        disablePDFJSWorkerThread: function() {
            PDFJS.workerSrc = void 0;
            return PDFJS.disableWorker = true;
        },

        handlePageDownload: function(pageRange, data) {
            return PDFJS.getDocument(data).then((function(_this) {
                return function(pdf) {
                    var delayedPageProcessor, incIndex, _i, _ref, _results;
                    _this.log("Created pdf proxy for pages(" + pageRange.start + " - " + pageRange.end + ")");
                    delayedPageProcessor = new viewerNS.DelayedTask(_this.processPage, _this, [pageRange]);
                    _results = [];
                    for (incIndex = _i = 1, _ref = _this.pageSetSize; _i <= _ref; incIndex = _i += 1) {
                        _results.push(_this.populateStorePartially(pdf, delayedPageProcessor, pageRange.start, incIndex));
                    }
                    return _results;
                };
            })(this), (function(_this) {
                return function(errorData) {
                    return _this.log(errorData);
                };
            })(this));
        },
        populateStorePartially: function(pdf, pageProcessor, startIndex, incIndex) {
            this.log("populating store for " + (startIndex + incIndex - 1));
            return pdf.getPage(incIndex).then((function(_this) {
                return function(page) {
                    var record, viewPort;
                    viewPort = page.getViewport(_this.zoomScale);
                    record = _this.pageStore.getAt(startIndex + incIndex - 2);
                    return page.getTextContent().then(function(data) {
                        var textData;
                        textData = data;
                        record.set("pageId", startIndex + incIndex - 1);
                        record.set("pageRef", page);
                        record.set("heightOrig", viewPort.height);
                        record.set("widthOrig", viewPort.width);
                        record.set("zoom", _this.zoomScale * 100);
                        record.set("rotate", page.rotate);
                        record.set("rendered", _this.pageStore.NOT_RENDERED);
                        record.set("zoomedHeight", viewPort.height);
                        record.set("zoomedWidth", viewPort.width);
                        record.set("textContent", textData);
                        record.set("downloadStatus", _this.pageStore.PARTIAL_DOWNLOADED);
                        return pageProcessor.delay(150);
                    });
                };
            })(this));
        },
        processPage: function(pageRange) {
            this.log("Processing Pages(" + pageRange.start + " - " + pageRange.end + ")");
            if (this.firstPageProcessedWithRange === false) {
                this.setupAllViewUsingPage(pageRange.start);
                return this.firstPageProcessedWithRange = true;
            } else {
                return this.renderView();
            }
        },
        totalCount: function() {
            return this.pageStore.getCount() ? this.pageStore.getCount() : 0;
        },

        entireDocDownloaded: function(pdfData) {
            this.haveCompleteDocumentInStore = true;
            this.processPdfData(pdfData);
        },

        processPdfData: function(pdfData) {
            this.enablePDFJSWorkerThread();
            return PDFJS.getDocument(pdfData).then((function(_this) {
                return function(pdf) {
                    var pageIndex, _i, _ref, _results;
                    _this.log("Created whole document pdf proxy object");
                    var pagesCount = pdf.numPages;
                    if(pagesCount && _this.totalPageCount != pagesCount){
                        _this.pageStore.clear();
                        _this.totalPageCount = pagesCount;
                        _this.createPageStoreEntries(true);
                    }
                    _results = [];
                    var resolveLastPage;
                    var textRetrievalPromise = new Promise(function(resolve, reject){
                        resolveLastPage = resolve;
                    });
                    _this.debug("populating store for " + pagesCount + " pages ");
                    _this.disableTextContent = true;                    
                    for (pageIndex = _i = 1, _ref = pagesCount; _i <= _ref; pageIndex = _i += 1) {
                        _results.push(_this.populateStore(pdf, pageIndex, pagesCount, resolveLastPage));
                    }
                    textRetrievalPromise.then(_this.setupAllView.bind(_this));
                    return _results;
                };
            })(this), (function(_this) {
                return function(errorData) {
                    return _this.log(errorData);
                };
            })(this));
        },

        //TODO refactor - actually populates store and initiates view setup
        populateStore: function(pdf, pageIndex, pagesCount, resolveLastPage) {
            return pdf.getPage(pageIndex).then((function(_this) {
                return function(page) {
                    var record, textData, viewPort;
                    textData = '';
                    viewPort = page.getViewport(_this.zoomScale);
                    record = _this.pageStore.getAt(pageIndex - 1);
                    record.set("pageId", page.pageNumber);
                    record.set("pageRef", page);
                    record.set("heightOrig", viewPort.height);
                    record.set("widthOrig", viewPort.width);
                    record.set("zoom", _this.zoomScale * 100);
                    record.set("rotate", page.rotate);
                    record.set("rendered", page.renderInProgress);
                    record.set("zoomedHeight", viewPort.height);
                    record.set("zoomedWidth", viewPort.width);
                    record.set("downloadStatus", _this.pageStore.DOWNLOADED);
                    if(_this.disableTextContent){
                        if(pagesCount == pageIndex){
                            resolveLastPage();
                            _this.debug("Resolved data for " + pagesCount + " pages");
                        }
                    }                    
                    else{
                        page.getTextContent().then(function(data) {
                            textData = data;
                            record.set("textContent", textData);
                            //_this.delayedSetupAllViewTask.delay(300);
                            if(pagesCount == pageIndex){
                                resolveLastPage();
                            }
                            _this.debug("Text layers retrieved for page at " + pageIndex);
                            if (page.pageNumber === _this.totalPageCount) {
                                return _this.eventBus.emitEvent('renderThumbs');
                            }
                        });
                    }
                };
            })(this));
        },

        //View related
        setupAllViewUsingPage: function(pageIndex) {
            var height, page, record, width, _i, _ref;
            record = this.pageStore.getAt(pageIndex);
            height = record.get('zoomedHeight');
            width = record.get('zoomedWidth');
            for (page = _i = 0, _ref = this.totalPageCount; _i < _ref; page = _i += 1) {
                this.setupViewUsingPage(page, height, width);
            }
            this.pageStore.each((function(_this) {
                return function(record) {
                    record.set('zoomedHeight', height);
                    return record.set('zoomedWidth', width);
                };
            })(this));
            this.pageView.refreshView();            
            this.renderView();
            this.manageThumbChange();
        },
        setupViewUsingPage: function(pageNo, height, width) {
            this.setupThumbView(pageNo);
            return this.pageView.setupPageDiv(pageNo + 1, height, width);
        },

        setupAllView: function() {
            var page, _i, _j, _ref, _ref1;
            this.enablePDFJSWorkerThread();
            if (this.firstPageProcessedWithRange === false) {
                for (page = _i = 0, _ref = this.totalPageCount; 0 <= _ref ? _i < _ref : _i > _ref; page = 0 <= _ref ? ++_i : --_i) {
                    this.setupView(page);
                }
            } else {
                for (page = _j = 0, _ref1 = this.totalPageCount; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; page = 0 <= _ref1 ? ++_j : --_j) {
                    this.resizeView(page);
                }
            }
            this.pageView.refreshView();
            this.disableTextContent = false;
            this.renderView();
            this.manageThumbChange();
        },
        setupView: function(pageIndex) {
            var cHeight, cWidth, record;
            this.setupThumbView(pageIndex);
            record = this.pageStore.getAt(pageIndex);
            if(record){
                cHeight = record.get('zoomedHeight');
                cWidth = record.get('zoomedWidth');
                return this.pageView.setupPageDiv(pageIndex + 1, cHeight, cWidth);
            }
        },
        setupThumbView: function (pageIndex) {
            this.pageView.setupThumbDiv(pageIndex + 1, this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT);
            this.thumbnailController.addClickListener(this.pageView.getThumbnailWrapperId(pageIndex + 1));
        },
        resizeView: function(pageIndex) {
            var cHeight, cWidth, record;
            record = this.pageStore.getAt(pageIndex);
            if (record.get('renderingStatus' !== this.pageStore.NOT_RENDERED)) {
                cHeight = record.get('zoomedHeight');
                cWidth = record.get('zoomedWidth');
                return this.pageView.resizePageDiv(pageIndex + 1, cHeight, cWidth);
            }
        },

        //rendering
        setupUpdatedView: function(page) {
            var cHeight, cWidth, record;
            record = this.pageStore.getAt(page);
            cHeight = record.get('zoomedHeight');
            cWidth = record.get('zoomedWidth');
            return this.pageView.resizePageDiv(page + 1, cHeight, cWidth);
        },

        //zoom
        zoom: function(zoomValue) {
            var newScale, scrollRelative, pageIndex, _i, _ref, me = this, ready = true;
            this.pageStore.each(function (page) {
                if (page.get('renderingStatus') === me.pageStore.REQUEST_RENDER ||
                        page.get('renderingStatus') === me.pageStore.RENDERING) {
                    ready = false;
                    return false;
                }
            });
            if (!ready) {
                this.eventBus.emitEvent(this.viewerId + 'zoomUpdated', [zoomValue]);
                return;
            }
            newScale = parseFloat(zoomValue / 100);
            scrollRelative = this.pageView.currentScrollPosition() / this.pageView.scrollHeight();
            for (pageIndex = _i = 0, _ref = this.pageStore.getCount(); _i < _ref; pageIndex = _i += 1) {
                this.updateViewZoom(pageIndex, newScale, zoomValue);
            }
            this.setupZoomView();
            this.pageView.setScroll(this.pageView.scrollHeight() * scrollRelative);
            this.zoomScale = newScale;
            this.renderView();
            this.eventBus.emitEvent(this.viewerId + 'zoomUpdated', [zoomValue]);
            return this.pageView.refreshView();
        },

        updateViewZoom: function(pageIndex, newScale, zoomValue) {
            var canvas, page, record, viewPort, textLayerDiv;
            record = this.pageStore.getAt(pageIndex);
            page = record.get('pageRef');
            viewPort = page.getViewport(newScale, record.get('rotate'));
            canvas = this.pageView.getCanvas(pageIndex + 1);
            canvas.height = viewPort.height;
            canvas.width = viewPort.width;
            textLayerDiv = this.pageView.getTextLayerDiv(pageIndex + 1);
            viewerNS.Util.DomUtility.applyStyles(textLayerDiv.id, {
                width: viewPort.width + 'px',
                height: viewPort.height + 'px'
            });
            record.set('zoom', zoomValue);
            record.set('renderingStatus', this.pageStore.NOT_RENDERED);
            record.set('zoomedHeight', viewPort.height);
            return record.set('zoomedWidth', viewPort.width);
        },
        setupZoomView: function() {
            var page, _i, _ref, _results;
            _results = [];
            for (page = _i = 0, _ref = this.pageStore.getCount(); 0 <= _ref ? _i < _ref : _i > _ref; page = 0 <= _ref ? ++_i : --_i) {
                _results.push(this.setupUpdatedView(page));
            }
            return _results;
        },

        //scroll
        manageViewScroll: function() {
            var currentScrollPos, pageHeight, pageNum, record, pageInfo, scrollRelativePage, totalHeight;
            currentScrollPos = this.pageView.currentScrollPosition();
            pageInfo = this.computePageNum(currentScrollPos);
            totalHeight = pageInfo.scrollHeightFromTop;//result[0];
            pageNum = pageInfo.pageNo;//result[1];
            this.debug("view scroll is at page " + pageNum);
            record = this.pageStore.getAt(pageNum - 1);
            if(!record){
                this.debug('not a valid scroll for pageNum :' + pageNum);
                return;
            }
            pageHeight = record.get('zoomedHeight');
            scrollRelativePage = currentScrollPos - (totalHeight - pageHeight);
            //TODO check if we need to maintain a current page number and shoot this only when change
            /**
             * if more than 75% of the next page is visible then set it as the current page
             */
            if ((scrollRelativePage * 100) / pageHeight >= 75) {
                this.log((scrollRelativePage * 100) / pageHeight + ' in ' + pageNum);
                this.eventBus.emitEvent(this.viewerId + 'pageNavigated', [pageNum + 1, this.totalCount()]);
            }
            else {
                this.eventBus.emitEvent(this.viewerId + 'pageNavigated', [pageNum, this.totalCount()]);
            }
        },
        manageThumbChange: function() {
            var height, scroll, start, end, thumbHeight, container, _i, page, canvasEl, requestRender = false;
            container = this.pageView.getThumbnailsContainer();
            height = container.clientHeight;
            scroll = container.scrollTop;
            thumbHeight = this.pageView.getThumbTotalHeight();
            start = (scroll - height) / thumbHeight;
            end = (scroll + 2 * height) / thumbHeight;
            for (_i = 0; _i < this.totalCount(); _i++) {
                page = this.pageStore.getAt(_i);
                if (page.get('downloadStatus') === this.pageStore.NOT_DOWNLOADED) {
                    continue;
                }
                if (_i >= start && _i <= end) {
                    if (page.get('thumbRenderingStatus') == this.pageStore.RENDERED) {
                        continue;
                    }
                    if (page.get('thumbRenderingStatus') != this.pageStore.REQUEST_RENDER) {
                        requestRender = true;
                    }
                    page.set('thumbRenderingStatus', this.pageStore.REQUEST_RENDER);
                } else if (page.get('thumbRenderingStatus') === this.pageStore.RENDERED) {
                    canvasEl = this.pageView.getThumbnailCanvas(_i + 1);
                    canvasEl.parentNode.removeChild(canvasEl);
                    page.set('thumbRenderingStatus', this.pageStore.NOT_RENDERED);
                }
            }
            if (requestRender) {
                this.doThumbnailsRendering();
            }
        },
        computePageNum: function(currentScrollPosition) {
            var currentPage, fullHeight, marginFix, results;
            currentPage = 1;
            fullHeight = 0;
            results = [];
            marginFix = 0; //TODO compute margin by css class when margin in place
            this.pageStore.each(function(page) {
                fullHeight += page.get('zoomedHeight');
                fullHeight += marginFix;
                currentPage = page.get('pageId');
                return currentScrollPosition >= fullHeight; // current scroll position beyond the total height of pages calculated from top
            });
            results.push(fullHeight);
            results.push(currentPage);
            var pageInfo = {pageNo: currentPage, scrollHeightFromTop: fullHeight};
            return pageInfo;
        },

        onViewScrolled: function() {
            this.renderView();
        },

        renderView: function() {
            var currentVisiblePages, page, visiblePagesIndces, canvasEl, _i;
            visiblePagesIndces = this.findVisiblePages();
            this.log("Pages from " + (visiblePagesIndces.start+1) + " to " + (visiblePagesIndces.end +1) + " are visible");
            currentVisiblePages = this.pageStore.getRange(visiblePagesIndces.start, visiblePagesIndces.end);
            this.assureDownload(currentVisiblePages);
            for (_i = 0; _i < this.totalCount(); _i++) {
                page = this.pageStore.getAt(_i);
                if (page.get('downloadStatus') === this.pageStore.NOT_DOWNLOADED) {
                    continue;
                }
                if (_i >= visiblePagesIndces.start && _i <= visiblePagesIndces.end) {
                    this.requestRendering(page);
                } else if (page.get('renderingStatus') === this.pageStore.RENDERED) {
                    canvasEl = this.pageView.getCanvas(_i + 1);
                    canvasEl.parentNode.removeChild(canvasEl);
                    this.pageView.getTextLayerDiv(_i + 1).innerHTML = "";
                    page.set('renderingStatus', this.pageStore.NOT_RENDERED);
                }
            }
            if (visiblePagesIndces.start > -1) {  //TODO check if we need to maintain a current page number and shoot this only when change
                this.eventBus.emitEvent(this.viewerId + 'pageNavigated', [visiblePagesIndces.start + 1, this.totalCount()]);
            }
            return this.doRendering();
        },

        assureDownload: function(pages) {
            var page;
            page = pages[0];
            if (page && page.get('downloadStatus') === this.pageStore.NOT_DOWNLOADED) {
                return this.eventBus.emitEvent('downloadPages', [this.getPageSet(page.get('pageId'))]);
            }
        },

        doThumbnailsRendering: function () {
            var i, page, pageRef, canvas, context, viewport, promises, pagesToRender, pageRenderedStatus = this.pageStore.RENDERED;
            promises = [];
            pagesToRender = [];
            for (i = 0; i < this.pageStore.getCount(); i++) {
                page = this.pageStore.getAt(i);
                if (page.get('thumbRenderingStatus') != this.pageStore.REQUEST_RENDER) {
                    continue;
                }
                pagesToRender.push(page);
                pageRef = page.get('pageRef');
                viewport = pageRef.getViewport(this.THUMBNAIL_SCALE);
                canvas = this.pageView.getThumbnailCanvas(i + 1, this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT);
                context = canvas.getContext('2d');
                promises.push(pageRef.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise);
            }
            Promise.all(promises).then(function () {
                for (i = 0; i < pagesToRender.length; i++) {
                    pagesToRender[i].set('thumbRenderingStatus', pageRenderedStatus);
                }
            });
        },

        doRendering: function(resolveWhenPageCount) {
            var renderedPages = 0, me = this;
            var itemsToProcess = this.getPageNumbersToRender();
            for (var _i = 0; _i < itemsToProcess.length; _i++) {
                this.pageStore.getAt(itemsToProcess[_i] - 1).set('renderingStatus', me.pageStore.RENDERING);
            }
            if(!resolveWhenPageCount){
                resolveWhenPageCount = itemsToProcess.length;
            }
            me.log('Pages to render :' + itemsToProcess);

            return new Promise( function(resolve, reject){

                if(itemsToProcess.length > 0){                
                    var page = me.pageStore.getAt(itemsToProcess[0] - 1);
                    var renderChain = itemsToProcess.reduce(function (previousPagePromise, currentPageNumber) {
                        return previousPagePromise.then(function (previousValue) {
                            // do what you want with previous value
                            // return your async operation
                            /*return Q.delay(100);*/
                                                
                            page = me.pageStore.getAt(currentPageNumber - 1);
                            me.log("Rendering page " + (page.get('pageId')));
                            return me.renderPage(page).then(function() {
                                renderedPages++;
                                if(renderedPages == resolveWhenPageCount){
                                    resolve();
                                }                                 
                            });
                        });
                    }, new Promise( function(resolve){resolve();}));

                    renderChain.then(function (lastResult) {
                        // ...
                    });            
                }
                else{
                    resolve();
                }

            });

        },

        getPageNumbersToRender: function() {
            var results = [], me = this;
            this.pageStore.each(function(page) {
                if (page.get('renderingStatus') === me.pageStore.REQUEST_RENDER) {
                    results.push(page.get('pageId')); 
                }
            });
            return results;            
        },

        renderPage: function(pageRecord) {
            var me = this;
            return new Promise( function(resolve, reject){
                var canvas, context, data, page, pageIndex, textLayerDiv, textLayerObject, viewPort, viewScale;
                //pageRecord.set('renderingStatus', me.pageStore.RENDERING);
                page = pageRecord.get('pageRef');
                pageIndex = pageRecord.get('pageId');
                //This should be the time the canvas gets created 
                canvas = me.pageView.getCanvas(pageIndex, pageRecord.get('zoomedHeight'), pageRecord.get('zoomedWidth'));
                viewScale = me.zoomScale;
                viewPort = page.getViewport(viewScale, pageRecord.get('rotate'));
                textLayerDiv = me.pageView.getTextLayerDiv(pageIndex);
                if(textLayerDiv){
                    textLayerDiv.innerHTML = "";
                    textLayerObject = me.pageView.createTextLayerObject(textLayerDiv, pageIndex, viewPort);
                    textLayerObject.findController = me.searchController; 
                }
                context = canvas.getContext('2d');
                return page.render({
                    canvasContext: context,
                    viewport: viewPort
                }).then((function(_this) {
                    return function() {
                        var pageNo = pageRecord.get('pageId');
                        _this.log("Rendered page " + pageNo);
                        resolve(pageRecord.get('pageId'));//promised page rendered
                        _this.removeLoadIcon(pageNo);
                        if (!_this.firstPageInStoreReady) {
                            _this.firstPageInStoreReady = true;
                            //_this.delayedFitByConfigTask.delay(100);
                        }                        
                        if(_this.disableTextContent === false){
                            _this.renderTextLayer(page, pageRecord, textLayerObject);
                        }
                    };
                })(me));

            });
        },

        renderTextLayer: function (page, pageRecord, textLayerObject) {
            var pageNo;
            pageRecord.set('renderingStatus', this.pageStore.RENDERED);
            this.pageView.requestHighlightHit();//after text render?
            pageNo = pageRecord.get('pageId');
            if (textLayerObject) {
                if (pageRecord.get('textContent')) {
                    textLayerObject.setTextContent(pageRecord.get('textContent'));
                    textLayerObject.render(this.TEXT_LAYER_RENDER_DELAY);
                }
                else {
                    page.getTextContent().then(
                        function textContentResolved(textContent) {
                            pageRecord.set('textContent', textContent);
                            textLayerObject.setTextContent(textContent);
                            textLayerObject.render(this.TEXT_LAYER_RENDER_DELAY);
                        }
                    );
                }
            }
            this.eventBus.emitEvent(this.viewerId + this.PAGE_RENDER_COMPLETE, [pageNo]);
            return this.log("Rendered text for " + pageNo);
        },

        findVisiblePages: function() {
            var currentScrollTop, totalHeightOfCanvasesToShow, endPage, canvasMargin, startPage, viewHeight;
            currentScrollTop = this.pageView.currentScrollPosition();
            startPage = 0;
            endPage = 0;
            totalHeightOfCanvasesToShow = 0;
            canvasMargin = this.pageView.getPageMargin();
            viewHeight = this.pageView.getViewableHeight();
            this.pageStore.each((function(_this) {
                return function(page) {
                    var currentPage, moreToProcess, unitCanvasHeight;
                    unitCanvasHeight = (_this.pageView === _this.pageView ? page.get('zoomedHeight') : _this.THUMBNAIL_HEIGHT);   //eg. 1200
                    currentPage = page.get('pageId'); // (1 : 1 )
                    if (unitCanvasHeight) { //DM check
                        totalHeightOfCanvasesToShow += unitCanvasHeight; // (1 : 0 + 1200)
                    }
                    totalHeightOfCanvasesToShow += canvasMargin; // (1 : 1200 + 0)
                    if (totalHeightOfCanvasesToShow > currentScrollTop && startPage === 0) {
                        startPage = currentPage;
                    } else if (totalHeightOfCanvasesToShow > currentScrollTop + viewHeight) {
                        endPage = currentPage;
                        return false;
                    }
                };
            })(this));
            endPage = endPage === 0 ? this.pageStore.getCount() : endPage;
            return {
                start: startPage - 1,
                end: endPage - 1
            };
        },

        //fit by config
        fitByConfig: function() {
            if(!this.fitConfig || this.fitConfig == this.FIT_TO_WIDTH){
                this.fitToWidth();
            }
        },

        //fit to width
        fitToWidth: function() {
            this.zoom(this.getScale(this.FIT_TO_WIDTH) * 100);
        },
        getScaleFromWidth: function(width) {
            var currenWidth, currentScale, newScale, record;
            record = this.pageStore.getAt(0);
            currenWidth = record.get('zoomedWidth');
            currentScale = this.zoomScale;
            newScale = (width - currenWidth) / 6;
            return newScale = newScale * 0.01 + this.zoomScale;
        },

        //fit to page height
        fitToHeight: function() {
            this.zoom(this.getScale(this.FIT_TO_HEIGHT) * 100);
        },
        //fit to page height
        actualSizeFit: function() {
            this.zoom(this.getScale(this.ACTUAL_SIZE_SCALE) * 100);
        },
        getScale: function(scalingRequired) {
            var firstPageWidth, firstPageHeight, firstPageScale, newScale, firstRecord;
            firstRecord = this.pageStore.getAt(0);
            firstPageWidth = firstRecord.get('zoomedWidth');
            firstPageHeight = firstRecord.get('zoomedHeight');
            firstPageScale = this.zoomScale;

            var pageWidthScale = (this.pageView.getViewableWidth()) /
                firstPageWidth * firstPageScale;
            var pageHeightScale = (this.pageView.getViewableHeight()) /
                firstPageHeight * firstPageScale;
            var result;
            switch (scalingRequired){
                case this.ACTUAL_SIZE_SCALE:
                    result = 1 * this.CSS_UNITS;
                    break;
                case this.FIT_TO_WIDTH:
                    result = pageWidthScale;
                    break;
                case this.FIT_TO_HEIGHT:
                    result = pageHeightScale;
                    break;
                case this.FIT_TO_PAGE:
                    result = Math.min(pageWidthScale, pageHeightScale);
                    break;
            }

            return result;
        },

        //navigate to page
        navigateToPage: function(page) {
            var pageNo;
            if(page.pageNo && Number.isInteger(page.pageNo)){
                pageNo = page.pageNo;
            }
            else if(page.relative){
                var pageInfo = this.computePageNum(this.pageView.currentScrollPosition());
                var currentPageNum = pageInfo.pageNo;

                switch(page.relative){
                    case "previous":
                    case "PREVIOUS":
                    case "prev":
                    case "PREV":
                        pageNo = currentPageNum-1;
                        break;
                    case "next":
                    case "NEXT":
                        pageNo = currentPageNum+1;
                        break;
                    case "first":
                    case "FIRST":
                        pageNo = 1;
                        break;
                    case "last":
                    case "LAST":
                        pageNo = this.totalCount();
                        break;
                }

            }
            if (pageNo && Number.isInteger(pageNo) && pageNo <= this.totalCount()) {
                this.pageView.navigateToPage(pageNo);
                this.eventBus.emitEvent(this.viewerId + 'pageNavigated', [pageNo, this.totalCount()]);
                //return this.viewerToolbar.updateField(pageNo);
            }
        },

        attachFullscreenListener: function () {
            document.addEventListener('fullscreenchange', this.onFullScreenChange.bind(this));
            document.addEventListener('MSFullscreenChange', this.onFullScreenChange.bind(this));
            document.addEventListener('mozfullscreenchange', this.onFullScreenChange.bind(this));
            document.addEventListener('webkitfullscreenchange', this.onFullScreenChange.bind(this));
        },

        isFullScreen: function() {
            return document.fullscreenElement || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement;
        },

        onFullScreenChange: function () {
            var defaultToolbar, fullscreenToolbar, thumbnailsContainer, thumbnailsBg;
            defaultToolbar = viewerNS.Util.DomUtility.jqw('#' + this.viewerId + "-toolbar .defaultToolbar")[0];
            fullscreenToolbar = viewerNS.Util.DomUtility.jqw('#' + this.viewerId + "-toolbar .fullscreenToolbar")[0];
            thumbnailsContainer = viewerNS.Util.DomUtility.jqw('#' + this.viewerId + ' .ecm-viewer-thumbnails-wrapper')[0];
            thumbnailsBg = viewerNS.Util.DomUtility.jqw('#' + this.viewerId + ' .ecd-thumbnails-bg')[0];
            if (this.isFullScreen()) {
                if (thumbnailsContainer.style.display === 'table-cell') {
                    thumbnailsContainer.style.display = 'none';
                    thumbnailsBg.style.display = 'none';
                    this.thumbWasOpened = true;
                }
                viewerNS.Util.DomUtility.applyStyles(defaultToolbar, {
                    display: 'none'
                });
                viewerNS.Util.DomUtility.applyStyles(fullscreenToolbar, {
                    display: 'block'
                });
            } else {
                if (this.thumbWasOpened) {
                    thumbnailsContainer.style.display = 'table-cell';
                    thumbnailsBg.style.display = 'table-cell';
                }
                viewerNS.Util.DomUtility.applyStyles(defaultToolbar, {
                    display: 'block'
                });
                viewerNS.Util.DomUtility.applyStyles(fullscreenToolbar, {
                    display: 'none'
                });
            }
        },

        onFullScreenRequest: function() {
            this.goFullScreen();
        },

        goFullScreen: function() {
            var wrapper;
            this.log('entering fullscreen mode');
            if (this.isFullScreen()) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else {
                    return false;
                }
            } else {
                wrapper = document.getElementById(this.pageView.viewerContainerId);
                if (document.documentElement.requestFullscreen) {
                    wrapper.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    wrapper.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullScreen) {
                    wrapper.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (document.documentElement.msRequestFullscreen) {
                    wrapper.msRequestFullscreen();
                } else {
                    return false;
                }
            }
            this.log('The fullscreen viewable height is :' + this.pageView.getViewableHeight());
        },

        removeLoadIcon: function(pageNumber) {
            return this.pageView.clearLoadMask(pageNumber);
        },

        onOpenFileRequest: function(file) {
            this.openLocalFile(file);
        },        

        //open local file
        openLocalFile: function(file) {
          this.fileReader = new FileReader();
          this.fileReader.onload = (function(_this) {
            return function(evt) {
              var buffer, dataArray;
              buffer = evt.target.result;
              dataArray = new Uint8Array(buffer);
              _this.reset();
              //_this.rePopulateStore();
              return _this.eventBus.emitEvent(_this.viewerId +'entireDocDownloaded', [dataArray]);
            };
          })(this);
          this.fileReader.onerror = (function(_this) {
            return function(evt) {
              return _this.log(evt.target.error.name);
            };
          })(this);
          return this.fileReader.readAsArrayBuffer(file);
        },        

        //print

        //leverage http://tjvantoll.com/2012/06/15/detecting-print-requests-with-javascript/ to remove the canvases added
        onPrintRequest: function() {
            if (!this.printing) {
                this.printing = true;
                this.initPrint();
            }
        },

        initPrint: function() {
            var i, page, printDiv, printCanvas, context, viewport, canvasWrapper, promises, me = this;
            printDiv = this.pageView.getPrintContainer();
            promises = [];
            for (i = 0; i < this.pageStore.getCount(); i++) {
                page = this.pageStore.getAt(i).get('pageRef');
                if (!viewport) {
                    viewport = page.getViewport(2.5, page.rotate);
                }
                printCanvas = document.createElement("canvas");
                printCanvas.width = viewport.width;
                printCanvas.height = viewport.height;
                printCanvas.style.width = '100%';
                printCanvas.style.height = '100%';
                canvasWrapper = document.createElement('div');
                canvasWrapper.style.cssText = 'width:' + viewport.width + 'px;height:' + viewport.height+'px;';
                canvasWrapper.appendChild(printCanvas);
                printDiv.appendChild(canvasWrapper);
                context = printCanvas.getContext('2d');
                promises.push(page.render({
                    canvasContext: context,
                    viewport: viewport
                    //intent: 'print'
                }).promise);
            }

            Promise.all(promises).then(function () {
                me.attachPrintListeners();
                //printFrame.focus();
                me.pageStyleSheet = document.createElement('style');
                me.pageStyleSheet.textContent =
                        '@supports ((size:A4) and (size:1pt 1pt)) {' +
                        '@page { size: ' + viewport.width + 'px ' + viewport.height + 'px; margin: 0;}' +
                        '}';
                document.querySelector('body').appendChild(me.pageStyleSheet);
                window.print();
            });

            //make sure they're all rendered and only then add canvas to frame
            //send out request to render

            //on promise to render resolved call 
            //this.onAllPrintPagesResolved();

            //TODO- refactor to use mozPrintCallback and window.match
        },

        onAllPrintPagesResolved: function() {
            var i, _i, _ref, printFrame;
            this.log('Printing');

            printFrame = this.pageView.getPrintContainer();
            this.attachPrintListeners(printFrame);

            for (i = _i = 0, _ref = this.pageStore.getCount(); _i < _ref; i = _i += 1) {
                //make sure they're all retrieved and only then add canvas to frame
                this.addCanvasToIframe(i + 1, printFrame);
            }

            printFrame.focus();
            printFrame.contentWindow.print();            
        },

        addCanvasToIframe: function(index, printFrame) {
            var context, printCanvas, sourceCanvas;
            sourceCanvas = this.pageView.getCanvas(index);
            printCanvas = document.createElement("canvas");
            printCanvas.height = sourceCanvas.height;
            printCanvas.width = sourceCanvas.width;

            printFrame.contentDocument.body.appendChild(printCanvas);
            context = printCanvas.getContext("2d");
            if (sourceCanvas.height !== 0 && sourceCanvas.width !== 0) {
                return context.drawImage(sourceCanvas, 0, 0);
            }
        },

        attachPrintListeners: function(printFrame) {
            var me = this;
            if (window && window.matchMedia) {
                var mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener(function (mql) {
                    if (mql.matches) {
                        me.beforePrint();
                    } else {
                        me.afterPrint();
                    }
                });
            }
            window.onbeforeprint = me.beforePrint.bind(me);
            window.onafterprint = me.afterPrint.bind(me);
        },
     
        beforePrint: function() {
            //this.disableTextContent = true;
            this.log('Before printing.');
        },        

        afterPrint: function() {
            this.log('After printing.');
            //this.disableTextContent = false;
            this.cleanPrintNodes();
            if (this.pageStyleSheet && this.pageStyleSheet.parentNode) {
                this.pageStyleSheet.parentNode.removeChild(this.pageStyleSheet);
                this.pageStyleSheet = null;
            }
            this.printing = false;
        },

        cleanPrintNodes: function() {
            var printDiv = this.pageView.getPrintContainer();
            if(printDiv){
                var printFrameContainer = printDiv;
                while (printFrameContainer.hasChildNodes()) {
                  printFrameContainer.removeChild(printFrameContainer.lastChild);
                }
            }
        },

        log: function(msg) {
            return viewerNS.Util.Logger.log(msg);
        },

        debug: function(msg) {
            return viewerNS.Util.Logger.debug(msg);
        },

        reset: function() {
            this.pageStore.each((function(_this) {
                return function(page) {
                    var pageRef = page.get('pageRef');
                    if(pageRef){
                        pageRef.destroy();
                    }
                    //TODO destroy text layer as well
                };
            })(this));

            this.pageStore.clear();
            this.pageView.cleanup();
            this.cleanPrintNodes();
        },

        destroy: function(){
            //clear canvases and pdfpages
            this.reset();
            //TODO remove event bus listeners
            this.eventBus.removeListener(this.viewerId + 'pageDownloaded', this.handlePageDownload.bind(this));
            this.eventBus.removeListener(this.viewerId + 'entireDocDownloaded', this.entireDocDownloaded.bind(this));

            this.eventBus.removeListener(this.viewerId + 'viewScroll', this.manageViewScroll.bind(this));
            this.eventBus.removeListener(this.viewerId + 'viewScroll', this.onViewScrolled.bind(this));

            this.eventBus.removeListener(this.viewerId + 'navigationRequest', this.navigateToPage.bind(this));
            this.eventBus.removeListener(this.viewerId + 'fitToWidthRequest', this.fitToWidth.bind(this));
            this.eventBus.removeListener(this.viewerId + 'fitToHeightRequest', this.fitToHeight.bind(this));
            this.eventBus.removeListener(this.viewerId + 'actualSizeScaleRequest', this.actualSizeFit.bind(this));
            this.eventBus.removeListener(this.viewerId + 'destroy', this.destroy.bind(this));            
        }
    });
}
/**
 * Zoom UI Controller
 *
 */
viewerNS.ZoomUIController = JClass._extend({
    MIN_ZOOM_SLIDER_INTERNAL: 0,
    MAX_ZOOM_SLIDER_INTERNAL: 100,

    init: function(config, eventBus, toolbar) {
        viewerNS.Util.initializeConfig(config, this);
        this.eventBus = eventBus;
        this.zoomValue = 51.66;
        this.registerListeners();
    },

    registerListeners: function() {
        this.eventBus.addListener(this.viewerId + 'zoomUpdated', this.onZoomUpdated.bind(this)); //from main controller
        this.eventBus.addListener(this.viewerId + 'zoomInRequest', this.zoomIn.bind(this)); //from ui elements
        this.eventBus.addListener(this.viewerId + 'zoomOutRequest', this.zoomOut.bind(this)); //from ui elements
        this.eventBus.addListener(this.viewerId + 'destroy', this.destroy.bind(this));
    },


    zoomIn: function() {
        this.zoomValue++;
        this.zoom(this.zoomValue);
    },

    zoomOut: function() {
        this.zoomValue--;
        this.zoom(this.zoomValue);
    },

    zoom: function(value) {
        var zoomValue;
        //value = parseInt(value);
        zoomValue = this._calculateZoom(value);
        this._publishZoomRequest(zoomValue);
    },

    onZoomUpdated: function(zoomValue) {
        this.zoomValue = this._calculateInternalZoom(zoomValue);
    },

    _calculateZoom: function(internalZoomLevel) {
        var max, midValue, min, zoomPercent;
        max = this.MAX_ZOOM_SLIDER_INTERNAL;
        min = this.MIN_ZOOM_SLIDER_INTERNAL;
        midValue = max / 2;
        zoomPercent = 10;
        if (internalZoomLevel < midValue) {
            zoomPercent = 10 + internalZoomLevel * 90 / midValue;
        } else {
            zoomPercent = 100 + ((internalZoomLevel - midValue) / midValue) * 1000;
        }
        return zoomPercent;
    },

    _calculateInternalZoom: function(zoomPercent) {
        var max, midValue, min, internalZoomLevel;
        max = this.MAX_ZOOM_SLIDER_INTERNAL;
        min = this.MIN_ZOOM_SLIDER_INTERNAL;
        midValue = max / 2;
        if (zoomPercent < 100) {
            internalZoomLevel = (zoomPercent - 10) * midValue / 90;
        } else {
            internalZoomLevel = (((zoomPercent - 100) / 1000) * midValue) + midValue;
        }
        return internalZoomLevel;
    },

    _publishZoomRequest: function(zoomValue) {
        this.eventBus.emitEvent(this.viewerId + 'zoomRequest', [zoomValue]);
    },

    destroy: function() {
        this.eventBus.removeListener(this.viewerId + 'zoomUpdated', this.onZoomUpdated.bind(this));
        this.eventBus.removeListener(this.viewerId + 'zoomInRequest', this.zoomIn.bind(this)); //from ui elements
        this.eventBus.removeListener(this.viewerId + 'zoomOutRequest', this.zoomOut.bind(this)); //from ui elements        
        this.eventBus.removeListener(this.viewerId + 'destroy', this.destroy.bind(this));
    }

});

/**
 * Search Controller
 *
 */
viewerNS.SearchController = JClass._extend({

    textLayer: [],
    queryMatches: [],
    currentSearchPage: 1,
    currentMatchIdx: 0, //match index is 0 based
    highlightAllState: false,
    currentSearchQuery: '',  

    init: function(config, eventBus, mainController) {
        viewerNS.Util.initializeConfig(config, this);
        this.eventBus = eventBus;
        this.mainController = mainController;
        this.pageStore = mainController.pageStore;
        this.pageView = mainController.pageView;
        this.active = true;
        this.registerListeners();
    },

    registerListeners: function() {
        this.eventBus.addListener(this.viewerId + 'searchRequest', this.onSearchRequest.bind(this)); //from main controller
        this.eventBus.addListener(this.viewerId + 'pageNavigated', this.onPageNavigated.bind(this));
        this.eventBus.addListener(this.viewerId + 'destroy', this.destroy.bind(this));
    },

    onSearchRequest: function(searchRequest) {
        this.search(searchRequest.searchPhrase);
    },

    onPageNavigated: function(pageNo, totalPages) {
        this.currentlyNavigatedPage = pageNo;
    },

    search: function(searchPhrase, currentSearchPage) {
        var queryLen, query, pageStore, pageView, pageRecord, totalPages, data, bidiTexts;

        pageStore = this.mainController.pageStore;
        pageView = this.mainController.pageView;
        this.checkCurrentMatches(searchPhrase);

        query = searchPhrase;
        queryLen = query.length;
        totalPages = pageStore.getCount();
        if(!currentSearchPage){
          if(this.currentSearchPage != this.currentlyNavigatedPage){
            this.currentSearchPage = this.currentlyNavigatedPage;
            this.pagesSearchedForPhrase = 0;
            this.currentMatchIdx = 0;
          }
        }
        else{
          this.pagesSearchedForPhrase++;
        }
        this.debug('Search request for phrase : -'+searchPhrase + '- in page:'+ this.currentSearchPage);
        this.debug('Search request for phrase : -'+searchPhrase + '- search index:'+ this.currentMatchIdx);

        if (this.pagesSearchedForPhrase > totalPages ) {
          this.debug("No more search results found for search phrase "+ query);          
          this.checkedWholeDoc = false;
          return;
        }

        pageRecord = pageStore.getAt(this.currentSearchPage - 1);
        
        if (this.currentMatchIdx === 0) { //first search for that phrase on the page - do an actual search
          data = pageRecord.get('textContent');
          bidiTexts = [];
          if(!data){
              var me = this;
              this.retrievePageTextContent(pageRecord).then(function(){
                me.search(query, me.currentSearchPage);
              });
              return;            
          }
          if (data && data.items) {
            bidiTexts = data.items;
          }  
          str = '';         

          for (j = 0; j < bidiTexts.length; j++) {
            str += bidiTexts[j].str;
          }
          this.queryMatches[this.currentSearchPage] = this.searchQuery(query, str);
        }

        //using the query matches from first search

        //skip to checking for a match on the next page if there is not match for the current page 
        //or if this is the last match on the current page
        if (this.queryMatches[this.currentSearchPage].length === 0 || 
              this.queryMatches[this.currentSearchPage].length === this.currentMatchIdx) {
          //TODO only do this if/when the next page's view is rendered and text data is loaded 
          
          this.currentSearchPage++;
          if(this.currentSearchPage > totalPages){
            this.currentSearchPage = 1;
          }
          this.currentMatchIdx = 0; //TODO check this
          this.search(query, this.currentSearchPage);
          return;
        }
        dive = document.getElementById(pageView.getTextLayerId(this.currentSearchPage));
        //dive.scrollIntoView();
        this.mainController.assureDownload(pageRecord);
        this.mainController.requestRendering(pageRecord);  
        this.mainController.doRendering().then(this.highlightCurrentSearchHit.bind(this));      
        //this.highlightCurrentSearchHit();
    },

    retrievePageTextContent: function(pageRecord) {
        var page = pageRecord.get('pageRef');

        var promise = new Promise(function(resolve, reject){
          page.getTextContent().then(
              function textContentResolved(textContent) {
                  pageRecord.set('textContent', textContent);
                  resolve();
              }
          );        
        });
        return promise;
    },

    searchQuery: function(query, textString) {
        var matchIdx, matches, queryLen;
        queryLen = query.length;
        if (queryLen === 0) {
          return;
        }
        matches = [];
        matchIdx = -queryLen;
        while (true) {
          matchIdx = textString.indexOf(query, matchIdx + queryLen);
          if (matchIdx === -1) {
            break;
          }
          matches.push(matchIdx);
        }
        return matches;
    },    

    checkCurrentMatches: function(newSearchPhrase) {
        var query = newSearchPhrase;
        if (this.currentSearchQuery !== query) {
          if (this.currentSearchQuery !== '') {
            this.clearAllMatches();
            this.queryMatches = [];
            this.currentSearchPage = this.currentlyNavigatedPage;
            this.currentMatchIdx = 0;
            this.pagesSearchedForPhrase = 0;
          }
          this.currentSearchQuery = query;
        }
    },

    clearAllMatches: function() {
      var i, j, textLayerObject, pageNo;

      var pagesCount = this.mainController.pageStore.getCount();
      var pageView = this.mainController.pageView;

      for(i = 0; i< pagesCount; i++){
        pageNo = i + 1;
        textLayerObject = pageView.getTextLayerObject(pageNo);
        if (textLayerObject && this.queryMatches[i]) {
          var matches = this.queryMatches[i];
          for(j = 0; j< matches.length; j++){
            textLayerObject.clearMatch(this.queryMatches[i][j]);  
          }          
        }
      }

    },

    highlightCurrentSearchHit: function() {
        var pageStore = this.mainController.pageStore;
        var record, textlayerObject;
        if (pageStore) {
          record = pageStore.getAt(this.currentSearchPage - 1);
        }
        if (this.currentSearchQuery && record.get("renderingStatus") === pageStore.RENDERED) {
          this.debug("Highlighting search hit " + this.currentMatchIdx + " on page " + this.currentSearchPage);
          textlayerObject = this.pageView.getTextLayerObject(this.currentSearchPage);
          var updated = textlayerObject.updateMatches();
        }
    },

    updateMatchPosition: function(pageIndex, index, textDivs,
                    beginDivIdx, endDivIdx){
      if (this.currentMatchIdx === index &&
          this.currentSearchPage === pageIndex) {
        /*scrollIntoView(textDivs[beginIdx], {
          top: FIND_SCROLL_OFFSET_TOP,
          left: FIND_SCROLL_OFFSET_LEFT
        });*/
        this.currentMatchIdx++;
        if (this.currentMatchIdx > this.queryMatches[this.currentSearchPage].length) {
          this.currentSearchPage++;
          return this.currentMatchIdx = 0; //TODO check this
        }
        textDivs[beginDivIdx].scrollIntoView();
      }

    },

    log: function(msg) {
        return viewerNS.Util.Logger.log(msg);
    },

    debug: function(msg) {
        return viewerNS.Util.Logger.debug(msg);
    },    

    destroy: function() {
        this.currentSearchQuery = '';
        this.clearAllMatches();
        this.queryMatches = [];
        this.currentSearchPage = 1;
        this.currentMatchIdx = 0;
        this.pagesSearchedForPhrase = 0;
        this.eventBus.removeListener(this.viewerId + 'searchRequest', this.onSearchRequest.bind(this));
        this.eventBus.removeListener(this.viewerId + 'destroy', this.destroy.bind(this));
    }

});

/**
 * Text layer creation from pdf.js data
 */
viewerNS.TextLayer = JClass._extend({
    MAX_TEXT_DIVS_TO_RENDER : 100000,

    initialize: function(textLayerDiv, pageIdx, viewport, findController) {
        this.textLayerDiv = textLayerDiv;
        this.textDivs = [];
        this.viewport = viewport;
        this.divContentDone = false;
        this.pageIdx = pageIdx;
        this.matches = [];
        this.findController = findController || null;
    },
    _finishRendering: function () {
        this.renderingDone = true;

        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('textlayerrendered', true, true, {
            pageNumber: this.pageNumber
        });
        this.textLayerDiv.dispatchEvent(event);
    },

    renderLayer: function () {
        var textLayerFrag = document.createDocumentFragment();
        var textDivs = this.textDivs;
        var textDivsLength = textDivs.length;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        // No point in rendering many divs as it would make the browser
        // unusable even after the divs are rendered.
        if (textDivsLength > this.MAX_TEXT_DIVS_TO_RENDER) {
            this._finishRendering();
            return;
        }

        var lastFontSize;
        var lastFontFamily;
        for (var i = 0; i < textDivsLength; i++) {
            var textDiv = textDivs[i];
            if (textDiv.dataset.isWhitespace !== undefined) {
                continue;
            }

            var fontSize = textDiv.style.fontSize;
            var fontFamily = textDiv.style.fontFamily;

            // Only build font string and set to context if different from last.
            if (fontSize !== lastFontSize || fontFamily !== lastFontFamily) {
                ctx.font = fontSize + ' ' + fontFamily;
                lastFontSize = fontSize;
                lastFontFamily = fontFamily;
            }

            var width = ctx.measureText(textDiv.textContent).width;
            if (width > 0) {
                textLayerFrag.appendChild(textDiv);
                var transform;
                if (textDiv.dataset.canvasWidth !== undefined) {
                    // Dataset values come of type string.
                    var textScale = textDiv.dataset.canvasWidth / width;
                    transform = 'scaleX(' + textScale + ')';
                } else {
                    transform = '';
                }
                var rotation = textDiv.dataset.angle;
                if (rotation) {
                    transform = 'rotate(' + rotation + 'deg) ' + transform;
                }
                if (transform) {
                    viewerNS.Util.DomUtility.applyStyles(textDiv, {
                        transform: transform
                    });
                    //viewerNS.Util.DomUtility.CustomStyle.setProp('transform' , textDiv, transform);
                }
            }
        }

        this.textLayerDiv.appendChild(textLayerFrag);
        this._finishRendering();
        this.updateMatches();
    },

    /**
     * Renders the text layer.
     * @param {number} timeout (optional) if specified, the rendering waits
     *   for specified amount of ms.
     */
    render: function (timeout) {
        if (!this.divContentDone || this.renderingDone) {
            return;
        }

        if (this.renderTimer) {
            clearTimeout(this.renderTimer);
            this.renderTimer = null;
        }

        if (!timeout) { // Render right away
            this.renderLayer();
        } else { // Schedule
            var self = this;
            this.renderTimer = setTimeout(function() {
                self.renderLayer();
                self.renderTimer = null;
            }, timeout);
        }
    },

    appendText: function (geom, styles) {
        var style = styles[geom.fontName];
        var textDiv = document.createElement('div');
        this.textDivs.push(textDiv);
        if (viewerNS.Util.DomUtility.isAllWhitespace(geom.str)) {
            textDiv.dataset.isWhitespace = true;
            return;
        }
        var tx = PDFJS.Util.transform(this.viewport.transform, geom.transform);
        var angle = Math.atan2(tx[1], tx[0]);
        if (style.vertical) {
            angle += Math.PI / 2;
        }
        var fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
        var fontAscent = fontHeight;
        if (style.ascent) {
            fontAscent = style.ascent * fontAscent;
        } else if (style.descent) {
            fontAscent = (1 + style.descent) * fontAscent;
        }

        var left;
        var top;
        if (angle === 0) {
            left = tx[4];
            top = tx[5] - fontAscent;
        } else {
            left = tx[4] + (fontAscent * Math.sin(angle));
            top = tx[5] - (fontAscent * Math.cos(angle));
        }
        textDiv.style.left = left + 'px';
        textDiv.style.top = top + 'px';
        textDiv.style.fontSize = fontHeight + 'px';
        textDiv.style.fontFamily = style.fontFamily;

        textDiv.textContent = geom.str;
        // |fontName| is only used by the Font Inspector. This test will succeed
        // when e.g. the Font Inspector is off but the Stepper is on, but it's
        // not worth the effort to do a more accurate test.
        if (PDFJS.pdfBug) {
            textDiv.dataset.fontName = geom.fontName;
        }
        // Storing into dataset will convert number into string.
        if (angle !== 0) {
            textDiv.dataset.angle = angle * (180 / Math.PI);
        }
        // We don't bother scaling single-char text divs, because it has very
        // little effect on text highlighting. This makes scrolling on docs with
        // lots of such divs a lot faster.
        if (textDiv.textContent.length > 1) {
            if (style.vertical) {
                textDiv.dataset.canvasWidth = geom.height * this.viewport.scale;
            } else {
                textDiv.dataset.canvasWidth = geom.width * this.viewport.scale;
            }
        }
    },

    setTextContent: function (textContent) {
        this.textContent = textContent;

        var textItems = textContent.items;
        for (var i = 0, len = textItems.length; i < len; i++) {
            this.appendText(textItems[i], textContent.styles);
        }
        this.divContentDone = true;
    },

    convertMatches: function (matches) {
        var i = 0;
        var iIndex = 0;
        var bidiTexts = this.textContent.items;
        var end = bidiTexts.length - 1;
        var queryLen = (this.findController === null ?
            0 : this.findController.currentSearchQuery.length);
        var ret = [];

        for (var m = 0, len = matches.length; m < len; m++) {
            // Calculate the start position.
            var matchIdx = matches[m];

            // Loop over the divIdxs.
            while (i !== end && matchIdx >= (iIndex + bidiTexts[i].str.length)) {
                iIndex += bidiTexts[i].str.length;
                i++;
            }

            if (i === bidiTexts.length) {
                console.error('Could not find a matching mapping');
            }

            var match = {
                begin: {
                    divIdx: i,
                    offset: matchIdx - iIndex
                }
            };

            // Calculate the end position.
            matchIdx += queryLen;

            // Somewhat the same array as above, but use > instead of >= to get
            // the end position right.
            while (i !== end && matchIdx > (iIndex + bidiTexts[i].str.length)) {
                iIndex += bidiTexts[i].str.length;
                i++;
            }

            match.end = {
                divIdx: i,
                offset: matchIdx - iIndex
            };
            ret.push(match);
        }

        return ret;
    },

    renderMatches: function (matches) {
        // Early exit if there is nothing to render.
        if (matches.length === 0) {
            return;
        }

        var bidiTexts = this.textContent.items;
        var textDivs = this.textDivs;
        var prevEnd = null;
        var pageIdx = this.pageIdx;
        var isSelectedPage = (this.findController === null ?
            false : (pageIdx === this.findController.currentSearchPage));
        var selectedMatchIdx = (this.findController === null ?
            -1 : this.findController.currentMatchIdx);
        var highlightAll = (this.findController === null ?
            false : this.findController.highlightAllState);
        var infinity = {
            divIdx: -1,
            offset: undefined
        };

        function beginText(begin, className) {
            var divIdx = begin.divIdx;
            textDivs[divIdx].textContent = '';
            appendTextToDiv(divIdx, 0, begin.offset, className);
        }

        function appendTextToDiv(divIdx, fromOffset, toOffset, className) {
            var div = textDivs[divIdx];
            var content = bidiTexts[divIdx].str.substring(fromOffset, toOffset);
            var node = document.createTextNode(content);
            if (className) {
                var span = document.createElement('span');
                span.className = className;
                span.appendChild(node);
                div.appendChild(span);
                return;
            }
            div.appendChild(node);
        }

        var i0 = selectedMatchIdx, i1 = i0 + 1;
        if (highlightAll) {
            i0 = 0;
            i1 = matches.length;
        } else if (!isSelectedPage) {
            // Not highlighting all and this isn't the selected page, so do nothing.
            return;
        }

        for (var i = i0; i < i1; i++) {
            var match = matches[i];
            var begin = match.begin;
            var end = match.end;
            var isSelected = (isSelectedPage && i === selectedMatchIdx);
            var highlightSuffix = (isSelected ? ' selected' : '');
            if (this.findController) {
                this.findController.updateMatchPosition(pageIdx, i, textDivs,
                    begin.divIdx, end.divIdx);
            }
            /*if (isSelected) {
                textDivs[begin.divIdx].scrollIntoView();
            }*/

            // Match inside new div.
            if (!prevEnd || begin.divIdx !== prevEnd.divIdx) {
                // If there was a previous div, then add the text at the end.
                if (prevEnd !== null) {
                    appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
                }
                // Clear the divs and set the content until the starting point.
                beginText(begin);
            } else {
                appendTextToDiv(prevEnd.divIdx, prevEnd.offset, begin.offset);
            }

            if (begin.divIdx === end.divIdx) {
                appendTextToDiv(begin.divIdx, begin.offset, end.offset,
                        'highlight' + highlightSuffix);
            } else {
                appendTextToDiv(begin.divIdx, begin.offset, infinity.offset,
                        'highlight begin' + highlightSuffix);
                for (var n0 = begin.divIdx + 1, n1 = end.divIdx; n0 < n1; n0++) {
                    textDivs[n0].className = 'highlight middle' + highlightSuffix;
                }
                beginText(end, 'highlight end' + highlightSuffix);
            }
            prevEnd = end;
        }

        if (prevEnd) {
            appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
        }
    },

    updateMatches: function () {
        // Only show matches when all rendering is done.
        if (!this.renderingDone) {
            return false;
        }

        // Clear all matches.
        var matches = this.matches;
        var textDivs = this.textDivs;
        var bidiTexts = this.textContent.items;
        var clearedUntilDivIdx = -1;

        // Clear all current matches.
        for (var i = 0, len = matches.length; i < len; i++) {
            var match = matches[i];
            var begin = Math.max(clearedUntilDivIdx, match.begin.divIdx);
            for (var n = begin, end = match.end.divIdx; n <= end; n++) {
                var div = textDivs[n];
                div.textContent = bidiTexts[n].str;
                div.className = '';
            }
            clearedUntilDivIdx = match.end.divIdx + 1;
        }

        if (this.findController === null || !this.findController.active) {
            return false;
        }

        // Convert the matches on the page controller into the match format
        // used for the textLayer.
        this.matches = this.convertMatches(this.findController === null ?
            [] : (this.findController.queryMatches[this.pageIdx] || []));
        this.renderMatches(this.matches);
        return true;
    },

    clearMatch: function (match) {
      var a, begin, bidiTexts, clearedUntilDivIdx, convertedMatch, div, matchElement, n, textDivs, _results;
      matchElement = [];
      matchElement[0] = match;
      convertedMatch = this.convertMatches(matchElement, match.Length);
      match = convertedMatch[0];
      textDivs = this.textDivs;
      bidiTexts = this.textContent.items;
      clearedUntilDivIdx = -1;
      begin = Math.max(clearedUntilDivIdx, match.begin.divIdx);
      n = begin;
      while (n <= match.end.divIdx) {
        div = textDivs[n];
        div.textContent = bidiTexts[n].str;
        div.className = "";
        n++;
      }
    },    

});


/**
 * User Actions linker
 */

viewerNS.UserActionElements = JClass._extend({
    init: function(viewerId, config, eventBus) {
        this.eventBus = eventBus;
        this.viewerId = viewerId;
        this.expectedConfigs = ['firstPage', 'previousPage', 'nextPage', 'lastPage',
            'actualSizeScale', 'fitToWidth', 'fitToHeight',
            'zoomIn', 'zoomOut','fullScreen', 'printDoc', 'searchInput', 'searchButton', 'openFile',
            'previousPageFullscreen', 'nextPageFullscreen', 'zoomOutFullscreen', 'zoomInFullscreen',
            'fitWidthFullscreen', 'fitHeightFullscreen', 'fullScreenFullscreen'
        ];
        this.expectedHandlers = ['pageNavigatedHandler', 'zoomUpdatedHandler'];
        this.initUserActionElements(config);
        this.initListeners();
    },

    initUserActionElements: function (config) {

        for (var item in config) {
            if (jQuery.inArray(item, this.expectedConfigs) > -1) {
                var element = viewerNS.Util.DomUtility.getElement(config[item], true);
                if (element) {
                    this[item] = element;
                }
            }
            if (jQuery.inArray(item, this.expectedHandlers) > -1) {
                var handlerFn = typeof(config[item]) == "function" ? config[item] : null;
                if (handlerFn) {
                    var eventName = this.viewerId + item.replace('Handler', '');
                    this.eventBus.addListener(eventName, handlerFn);
                }
            }
        }

    },

    initListeners: function () {
        // Attach the event listeners.
        var clickableElements = [
            { element: this.firstPage, handler: this.firstPageClick },
            { element: this.previousPage, handler: this.previousPageClick },
            { element: this.nextPage, handler: this.nextPageClick },
            { element: this.lastPage, handler: this.lastPageClick },
            { element: this.actualSizeScale, handler: this.actualSizeScaleClick },
            { element: this.fitToHeight, handler: this.fitToHeightClick },
            { element: this.fitToWidth, handler: this.fitToWidthClick },
            { element: this.fullScreen, handler: this.fullScreenClick },
            { element: this.openFile, handler: this.openFileClick },            
            { element: this.printDoc, handler: this.printDocClick },
            { element: this.zoomIn, handler: this.zoomInClick },
            { element: this.zoomOut, handler: this.zoomOutClick},

            {element: this.previousPageFullscreen, handler: this.previousPageClick},
            {element: this.nextPageFullscreen, handler: this.nextPageClick},
            {element: this.zoomOutFullscreen, handler: this.zoomOutClick},
            {element: this.zoomInFullscreen, handler: this.zoomInClick},
            {element: this.fullScreenFullscreen, handler: this.fullScreenClick}
        ];

        var inputElements = [
            {element: this.searchInput, handler: this.onSearchClick}
        ];
        var clickElement, element;
        for (clickElement in clickableElements) {
            element = clickableElements[clickElement].element;
            if (element) {
                element.addEventListener('click', clickableElements[clickElement].handler.bind(this));
            }
        }
        var input;
        for (input in inputElements) {
            element = inputElements[input].element;
            if (element) {
                element.addEventListener('keypress', inputElements[input].handler.bind(this));
            }
        }
    },

    firstPageClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'navigationRequest', [{pageNo:1}]);
    },

    previousPageClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'navigationRequest', [{relative:'previous'}]);
    },

    nextPageClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'navigationRequest', [{relative:'next'}]);
    },

    lastPageClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'navigationRequest', [{relative:'last'}]);
    },

    fitToWidthClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'fitToWidthRequest');
    },

    actualSizeScaleClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'actualSizeScaleRequest');
    },

    fitToHeightClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'fitToHeightRequest');
    },

    fullScreenClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'fullScreenRequest');
    },

    printDocClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'printDocRequest');
    },

    openFileClick: function() {
        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          // Great success! All the File APIs are supported.
        } else {
          //alert('The File APIs are not fully supported in this browser.');
          return;
        }

        if (!this.fileinput) {
            this.fileinput = document.createElement('input');
            this.fileinput.id = this.viewerId + 'loadFileButton';
            this.fileinput.type = 'file';
            this.fileinput.style.visibility = 'hidden';
            this.fileinput.addEventListener('change', (function(_this) {
              return function(evt) {
                return _this.eventBus.emitEvent(_this.viewerId + 'openFileRequest', [evt.target.files[0]]);
              };
            })(this), false);
            return this.fileinput.click();
        } else {
            return this.fileinput.click();
        }

        //this.eventBus.emitEvent(this.viewerId + 'openFileRequest');
    },

    zoomInClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'zoomInRequest');
    },

    zoomOutClick: function() {
        this.eventBus.emitEvent(this.viewerId + 'zoomOutRequest');
    },

    onSearchClick: function(searchEvent) {
        var keyCode = searchEvent.keyCode || searchEvent.which;
        if (keyCode == '13'){
          // Enter pressed
          var searchPhrase = this.searchInput.value;
          this.eventBus.emitEvent(this.viewerId + 'searchRequest', [{searchPhrase: searchPhrase}]);
          return false;
        }        
    }

});
/**
 * Default toolbar
 */
viewerNS.DefaultToolbar = JClass._extend({
    DEFAULT_PATH: 'app/templates/toolbar.html',
    init: function(config, eventBus) {
        viewerNS.Util.initializeConfig(config, this);
        this.eventBus = eventBus;
        this.eventBus.addListener('progressUpdate', this.updateProgress.bind(this) );
        this.initialConfig = config;
        if(!this.toolbarPath){
            this.toolbarPath = this.DEFAULT_PATH;
        }
        this.render();
    },

    render: function() {
        var toolbarWrapper = document.createElement('div');
        toolbarWrapper.id = this.viewerId +'-toolbar';
        toolbarWrapper.setAttribute('class', 'ecm-viewer-toolbar-wrapper');
        this.toolbarWrapper = toolbarWrapper;
        viewerNS.Util.DomUtility.documentReady(this.initHtml.bind(this));

        this.readPartial(this.toolbarPath).then(this.addToolbarToView.bind(this));
    },

    readPartial: function (path){
        return new Promise(function (resolve, reject){
            viewerNS.Util.DomUtility.ajaxRequest(path, {}, function (data, status){
                if (status != 200) {
                    reject(data.statusText);
                }
                else {
                    resolve(data);
                }
            });
        });
    },

    initHtml: function () {
        viewerNS.Util.DomUtility.getElement(this.viewerContainerId).append(this.toolbarWrapper);
    },

    addToolbarToView: function(partial){
        var fragment = document.createDocumentFragment();
        var temp = document.createElement('div'), child;
        temp.innerHTML = partial;
        while (child = temp.firstChild) {
            fragment.appendChild(child);
        }
        this.toolbarWrapper.appendChild(fragment);

        this.updateUserInputConfig();
        new viewerNS.UserActionElements(this.viewerId, this.initialConfig, this.eventBus);

    },

    getToolbarElement: function (itemLocator) {
        return viewerNS.Util.DomUtility.jqw('#' + this.toolbarWrapper.id + " " + itemLocator)[0];
    },

    getFullscreenToolbarElement: function (itemLocator) {
        return viewerNS.Util.DomUtility.jqw('#' + this.toolbarWrapper.id + " .fullscreen-toolbar " + itemLocator)[0];
    },

    updateUserInputConfig: function () {
        var pageChangeFn, zoomChangeFn;
        var pageNumInput = this.getToolbarElement('.ecd-page-num-input');
        var pageNumEl = this.getToolbarElement('.ecd-page-num');
        var pageTotal = this.getToolbarElement('.ecd-page-count');
        var zoomCustomSelect = this.getToolbarElement('.ecd-zoom-custom-select');
        var zoomSelect = this.getToolbarElement('.ecd-zoom-select');

        var firstPage = this.getToolbarElement('.ecd-first');
        var previousPage = this.getToolbarElement('.ecd-previous');
        var nextPage = this.getToolbarElement('.ecd-next');
        var lastPage = this.getToolbarElement('.ecd-last');
        var fitWidth = this.getToolbarElement('.ecd-fit-to-width');
        var fitHeight = this.getToolbarElement('.ecd-fit-to-height');
        var zoomIn = this.getToolbarElement('.ecd-zoom-in');
        var zoomOut = this.getToolbarElement('.ecd-zoom-out');
        var actualSizeScale = this.getToolbarElement('.ecd-actual-size-scale');
        var fullScreen = this.getToolbarElement('.ecd-full-screen');
        var printDoc = this.getToolbarElement('.ecd-print');
        var searchText = this.getToolbarElement('.ecd-search-text');
        var searchButton = this.getToolbarElement('.ecd-search-button');
        var sidebar = this.getToolbarElement('.ecd-sidebar');
        var openFile = this.getToolbarElement('.ecd-local-file');

        var progressBar = this.getToolbarElement('.ecd-progress-bar');
        var progressBarContainer = this.getToolbarElement('.ecd-progress-container');

        var previousPageFullscreen = this.getFullscreenToolbarElement('.ecd-previous');
        var nextPageFullscreen = this.getFullscreenToolbarElement('.ecd-next');
        var pageNumInputFullscreen = this.getFullscreenToolbarElement('.ecd-page-num-input');
        var pageNumElFullscreen = this.getFullscreenToolbarElement('.ecd-page-num');
        var pageTotalFullscreen = this.getFullscreenToolbarElement('.ecd-page-count');
        var zoomOutFullscreen = this.getFullscreenToolbarElement('.ecd-zoom-out');
        var zoomInFullscreen = this.getFullscreenToolbarElement('.ecd-zoom-in');
        var fullScreenFullscreen = this.getFullscreenToolbarElement('.ecd-full-screen');

        var thumbnailsContainer = viewerNS.Util.DomUtility.jqw('#' + this.viewerId + ' .ecm-viewer-thumbnails-wrapper')[0];
        var thumbnailsBg = viewerNS.Util.DomUtility.jqw('#' + this.viewerId + ' .ecd-thumbnails-bg')[0];

        var me = this;

        if(pageNumInput){
            pageNumInput.addEventListener("change", function(){
                if (pageNumInput.value > 0) {
                    me.eventBus.emitEvent(me.viewerId + 'navigationRequest', [
                        {pageNo: parseInt(pageNumInput.value)}
                    ]);
                }
            });
        }

        if (pageNumInputFullscreen) {
            pageNumInputFullscreen.addEventListener("change", function () {
                if (pageNumInputFullscreen.value > 0) {
                    me.eventBus.emitEvent(me.viewerId + 'navigationRequest', [
                        {pageNo: parseInt(pageNumInputFullscreen.value)}
                    ]);
                }
            });
        }

        pageChangeFn = function (pageNum, totalPages) {
            if (pageNumInput) {
                pageNumInput.value = pageNum;
                //pageNumInput.style.width = pageTotal.offsetWidth * 1.8 + 'px';
            }
            if (pageNumEl && pageTotal) {
                pageNumEl.innerHTML = pageNum;
                pageTotal.innerHTML = totalPages;
            }
            if (pageNumInputFullscreen) {
                pageNumInputFullscreen.value = pageNum;
            }
            if (pageNumElFullscreen && pageTotalFullscreen) {
                pageNumElFullscreen.innerHTML = pageNum;
                pageTotalFullscreen.innerHTML = totalPages;
            }
        };

        zoomChangeFn = function (zoom) {
            if (zoomCustomSelect) {
                zoomCustomSelect.innerHTML = Math.round(zoom) + '%';
                zoomSelect.value = "";
            }
        };

        if (zoomSelect) {
            zoomSelect.addEventListener("change", function () {
                me.eventBus.emitEvent(me.viewerId + 'zoomRequest', [parseFloat(zoomSelect.value)]);
            });
        }

        sidebar.addEventListener("click", function() {
            if (thumbnailsContainer.style.display === 'table-cell') {
                thumbnailsContainer.style.display = 'none';
                thumbnailsBg.style.display = 'none';
            } else {
                thumbnailsContainer.style.display = 'table-cell';
                thumbnailsBg.style.display = 'table-cell';
                me.eventBus.emitEvent(me.viewerId + 'thumbChange');
            }
        });

        this.initialConfig.pageNavigatedHandler = pageChangeFn;
        this.initialConfig.zoomUpdatedHandler = zoomChangeFn;
        this.initialConfig.firstPage = firstPage;
        this.initialConfig.previousPage = previousPage;
        this.initialConfig.nextPage = nextPage;
        this.initialConfig.lastPage = lastPage;
        this.initialConfig.fitToWidth = fitWidth;
        this.initialConfig.fitToHeight = fitHeight;
        this.initialConfig.zoomIn = zoomIn;
        this.initialConfig.zoomOut = zoomOut;
        this.initialConfig.actualSizeScale = actualSizeScale;
        this.initialConfig.fullScreen = fullScreen;
        this.initialConfig.printDoc = printDoc;
        this.initialConfig.searchInput = searchText;
        this.initialConfig.searchButton = searchButton;
        this.initialConfig.openFile = openFile;
        this.progressBar = progressBar;
        this.progressBarContainer = progressBarContainer;

        this.initialConfig.previousPageFullscreen = previousPageFullscreen;
        this.initialConfig.nextPageFullscreen = nextPageFullscreen;
        this.initialConfig.zoomOutFullscreen = zoomOutFullscreen;
        this.initialConfig.zoomInFullscreen = zoomInFullscreen;
        this.initialConfig.fullScreenFullscreen = fullScreenFullscreen;

        return this.initialConfig;
    },

    updateProgress: function(loaded, total) {
        var percentLoaded = loaded/total * 100;
        if(this.progressBar){
            this.progressBar.style.width = percentLoaded + "%";
            /*if(percentLoaded == 100) {
                this.progressBarContainer.style.visibility = "hidden";
            }*/
        }

    },

    reset: function() {
        if (this.progressBar) {
            this.progressBar.className="";
            this.progressBar.style.width = "0";
            this.progressBar.offsetWidth = this.progressBar.offsetWidth;
            this.progressBar.className="ecd-progress-bar";
        }
    }

});

/**
 * Page view - container for page canvas elements and text layer
 */

viewerNS.PageView = JClass._extend({
    viewerId: '',
    listenToMouseEvents: false,
    SCROLLBAR_PADDING: 30,
    VERTICAL_PADDING: 5,

    tpl: new viewerNS.Util.TemplateManager.compile(
            '<div id="{{=it.pageContainerId}}" class="page" style="width: {{=it.width}}px; height: {{=it.height}}px;"><div id="{{=it.textLayerId}}" class="textLayer" style="width: {{=it.width}}px; height: {{=it.height}}px;"></div></div>'),
    thumbTpl: new viewerNS.Util.TemplateManager.compile(
            '<div class="thumb-wrapper" id="{{=it.thumbWrapperId}}" data-pageNo="{{=it.pageNo}}"><div id="{{=it.thumbContainerId}}" class="thumb" style="width: {{=it.width}}px; height: {{=it.height}}px;"></div><div class="page-no">{{=it.pageNo}}</div></div>'),

    init: function(config) {
        viewerNS.Util.initializeConfig(config, this);
        this.printContainerId = this.viewerId + "-printContainer";
        this.printContainerHtml = '<div id="'+this.printContainerId+'" class="printContainer" style="width:100%; height:100%; left: 0; top: 0; position: absolute; visibility: hidden;"></div>';
        this.pagesContainerId =  this.viewerId + '-contents';
        this.thumbnailsContainerId = this.viewerId + '-thumbnails';
        this.pagesContainerHtml = '<div class="ecm-viewer-body"><div class="ecm-viewer-main"><div style="width: 100%; height: 100%; position: relative"><div class="ecmContentViewer body row" id="' + this.pagesContainerId + '"></div></div></div><div class="ecm-viewer-thumbnails-wrapper no-select"><div style="width: 100%; height: 100%; position: relative"><div class="ecm-viewer-thumbnails" id="'+this.thumbnailsContainerId+'"></div></div></div></div>';
        viewerNS.Util.DomUtility.documentReady(this.initHtml.bind(this));

        this.enableTextSelection();
        this.textLayer = [];
        this.delayedScrollTask = new viewerNS.DelayedTask((function(_this) {
            return function() {
                return _this.eventBus.emitEvent(_this.viewerId + 'viewScroll');
            };
        })(this));
        this.delayedScrollThumbTask = new viewerNS.DelayedTask((function(_this) {
            return function() {
                return _this.eventBus.emitEvent(_this.viewerId + 'thumbChange');
            };
        })(this));
        //return this.callParent(arguments);
    },

    initHtml: function () {
        viewerNS.Util.DomUtility.append(viewerNS.Util.DomUtility.getBodyElement(), this.printContainerHtml);
        viewerNS.Util.DomUtility.append(this.viewerContainerId, this.pagesContainerHtml);
        this.pagesContainer = viewerNS.Util.DomUtility.getElement(this.pagesContainerId);
        this.afterrender();
    },

    afterrender: function() {
        this.setupFirstPage();
        var pageContainerEl = document.getElementById(this.pagesContainerId);

        if(!pageContainerEl){
            return;
        }

        pageContainerEl.addEventListener('scroll', ((function(_this) {
            return function(e) {
                return _this.scrolled(e);
            };
        })(this)), true);

        pageContainerEl.addEventListener('mousedown', ((function(_this) {
            return function(e) {
                return _this.mouseDown(e);
            };
        })(this)), true);
        pageContainerEl.addEventListener('mousemove', ((function(_this) {
            return function(e) {
                return _this.mouseMove(e);
            };
        })(this)), true);
        pageContainerEl.addEventListener('mouseup', ((function(_this) {
            return function(e) {
                return _this.mouseUp(e);
            };
        })(this)), true);
        document.getElementById(this.thumbnailsContainerId).addEventListener('scroll', ((function(_this) {
            return function() {
                return _this.delayedScrollThumbTask.delay(100);
            };
        })(this)), true);
    },

    getAllPagesContainer: function() {
        return document.getElementById(this.pagesContainerId);
    },

    getThumbnailsContainer: function() {
        return document.getElementById(this.thumbnailsContainerId);
    },

    getPrintContainer: function() {
        return document.getElementById(this.printContainerId);
    },

    getPageContainer: function(pageNo) {
        return document.getElementById(this.getPageContainerId(pageNo));
    },

    setupPageDiv: function(pageNo, height, width) {
        if (this.getPageContainer(pageNo)) {
            this.resizePageDiv(pageNo, height, width);
        } else {
            viewerNS.Util.DomUtility.append("" + this.pagesContainerId, this.tpl({
                pageContainerId: this.getPageContainerId(pageNo),
                canvasId: this.getPageId(pageNo),
                height: height,
                width: width,
                loadingIconId: this.getLoadingIconId(pageNo),
                textLayerId: this.getTextLayerId(pageNo)
            }));
        }
        var allPagesContainer = this.getAllPagesContainer();
        if(allPagesContainer){        
            allPagesContainer.onselectstart = ((function(_this) {
                return function() {
                    return _this.canSelectText;
                };
            })(this));
        }    
    },
    setupThumbDiv: function(pageNo, width, height) {
        viewerNS.Util.DomUtility.append("" + this.thumbnailsContainerId, this.thumbTpl({
            pageNo: pageNo,
            thumbContainerId: this.getThumbnailContainerId(pageNo),
            thumbWrapperId: this.getThumbnailWrapperId(pageNo),
            width: width,
            height: height,
            loadingIconId: this.getLoadingIconId(pageNo)
        }));
    },
    setupFirstPage: function() {
        //return this.setupPageDiv(1, 800, 600);
    },
    getTextLayerObject: function(pageNo) {
        return this.textLayer[pageNo];
    },
    createTextLayerObject: function(textLayerDiv, pageId, viewPort) {
        this.textLayer[pageId] = new viewerNS.TextLayer();
        var canvas = this.getCanvas(pageId);
        this.textLayer[pageId].initialize(textLayerDiv, pageId, viewPort);
        textLayerDiv.style.width = canvas.width;
        textLayerDiv.style.height = canvas.height;
        viewerNS.Util.DomUtility.applyStyles(textLayerDiv.id, {
            width: canvas.width + 'px',
            height: canvas.height + 'px'
        });
        return this.textLayer[pageId];
    },
    requestHighlightHit: function() {
        return this.eventBus.emitEvent('highlightCurrentSearchHit');
    },
    enableTextSelection: function() {
        return this.canSelectText = true;
    },
    disableTextSelection: function() {
        return this.canSelectText = false;
    },
    refreshView: function() {
        //return this.doLayout();
    },
    resizePageDiv: function(pageIndex, height, width) {
        return viewerNS.Util.DomUtility.applyStyles(this.getPageContainerId(pageIndex), {
            width: width + 'px',
            height: height + 'px'
        });
    },
    getCanvas: function(pageNumber, height, width) {
        var canvasEl, pageContainer;
        pageContainer = this.getPageContainer(pageNumber);
        if (pageContainer && !document.getElementById(this.getPageId(pageNumber))) {
            canvasEl = document.createElement('canvas');
            canvasEl.id = this.getPageId(pageNumber);
            //canvasEl.setAttribute('style', "border:1px solid rgba(128, 128, 128, 0.25)"); //TODO Dev only border for canvas - helps identify
            canvasEl.height = height;
            canvasEl.width = width;
            pageContainer.appendChild(canvasEl);
        }
        return document.getElementById(this.getPageId(pageNumber));
    },
    getThumbnailCanvas: function(pageNumber, width, height) {
        var canvasEl, thumbContainer;
        canvasEl = document.getElementById(this.getThumbnailCanvasId(pageNumber));
        thumbContainer = document.getElementById(this.getThumbnailContainerId(pageNumber));
        if (thumbContainer && !canvasEl) {
            canvasEl = document.createElement('canvas');
            canvasEl.id = this.getThumbnailCanvasId(pageNumber);
            if (pageNumber == 1) canvasEl.className = 'thumbnail-selected';
            canvasEl.height = height;
            canvasEl.width = width;
            thumbContainer.appendChild(canvasEl);
        }
        return canvasEl;
    },
    getPageMargin: function() {
        var page;
        if (this.pageMarginTopValue) {
            return this.pageMarginTopValue;
        }
        page = document.getElementsByClassName("page")[0];
        return this.pageMarginTopValue = +(page.currentStyle || window.getComputedStyle(page)).marginBottom.replace('px', '');
    },
    getThumbTotalHeight: function() {
        var thumb, height;
        if (this.thumbTotalHeightValue) {
            return this.thumbTotalHeightValue;
        }
        thumb = document.getElementsByClassName("thumb-wrapper")[0];
        height = thumb.clientHeight;
        if (height == 0) return 0;
        return this.thumbTotalHeightValue = height + +(thumb.currentStyle || window.getComputedStyle(thumb)).marginBottom.replace('px', '');
    },
    getTextLayerDiv: function(pageNumber) {
        var pageContainer, textLayerEl;
        pageContainer = this.getPageContainer(pageNumber);
        if (pageContainer && !document.getElementById(this.getTextLayerId(pageNumber))) {
            textLayerEl = document.createElement('div');
            textLayerEl.id = this.getTextLayerId(pageNumber);
            textLayerEl.setAttribute('class', 'textLayer');
            pageContainer.appendChild(textLayerEl);
        }
        return document.getElementById(this.getTextLayerId(pageNumber));
    },
    getPageId: function(value) {
        return "" + this.viewerId + "-canvas-page-" + value;
    },
    getPageContainerId: function(value) {
        return "" + this.viewerId + "-pageContainer-" + value;
    },
    getThumbnailCanvasId: function(value) {
        return "" + this.viewerId + "-thumbnail-canvas-" + value;
    },
    getThumbnailContainerId: function(value) {
        return "" + this.viewerId + "-thumbnail-container-" + value;
    },
    getThumbnailWrapperId: function(value) {
        return "" + this.viewerId + "-thumbnail-wrapper-" + value;
    },
    getTextLayerId: function(value) {
        return "" + this.viewerId + "-textLayer-" + value;
    },
    getLoadingIconId: function(value) {
        return "" + this.viewerId + "-loading-" + value;
    },
    navigateToPage: function(pageNo) {
        var pageDiv;
        pageDiv = document.getElementById(this.getPageContainerId(pageNo));
        pageDiv.scrollIntoView();
        //viewerNS.Util.DomUtility.scrollIntoView(pageDiv);
        pageDiv.parentElement.scrollTop++; //increase it by one to step into the next page and not be on the border of previous and current
    },
    getViewableHeight: function() {
        return viewerNS.Util.DomUtility.getHeight(this.pagesContainer);// - this.VERTICAL_PADDING;
    },
    getViewableWidth: function() {
        return viewerNS.Util.DomUtility.getWidth(this.pagesContainer) - this.SCROLLBAR_PADDING;
    },
    currentScrollPosition: function() {
        return viewerNS.Util.DomUtility.getScrollTop(this.pagesContainer);
    },
    scrollHeight: function() {
        return viewerNS.Util.DomUtility.getScrollHeight(this.pagesContainer);
    },
    setScroll: function(value) {
        return viewerNS.Util.DomUtility.setScrollTop(this.pagesContainer, value);
    },
    scrolled: function () {
        return this.delayedScrollTask.delay(100);
    },
    startListeningToMouseEvents: function() {
        return this.listenToMouseEvents = true;
    },
    stopListeningToMouseEvents: function() {
        return this.listenToMouseEvents = false;
    },
    clearLoadMask: function(pageNumber) {
        var loadingEl;
        loadingEl = document.getElementById(this.getLoadingIconId(pageNumber));
        if (loadingEl) {
            loadingEl.parentNode.removeChild(loadingEl);
        }
        if (pageNumber === 3) {
            return this.clearLoadMask(4);
        }
    },
    mouseDown: function(event) {
        var pos;
        if (this.listenToMouseEvents) {
            pos = this.processMouseEvent(event);
            Ext.apply(pos, {
                dragging: false
            });
            if (pos) {
                return this.eventBus.emitEvent('mouseDown', [pos]);
            }
        }
    },
    mouseMove: function(event) {
        var pos;
        if (this.listenToMouseEvents) {
            pos = this.processMouseEvent(event);
            Ext.apply(pos, {
                dragging: true
            });
            if (pos) {
                return this.eventBus.emitEvent('mouseMove', [pos]);
            }
        }
    },
    mouseUp: function(event) {
        var pos;
        if (this.listenToMouseEvents) {
            pos = this.processMouseEvent(event);
            if (pos) {
                return this.eventBus.emitEvent('mouseUp');
            }
        }
    },
    getCanvasSnapShot: function(pageNo) {
        var canvas;
        canvas = this.getCanvas(pageNo);
        return canvas.toDataURL("image/png");
    },
    redrawCanvas: function(pageNo, snapShot) {
        var canvas, context, img;
        canvas = this.getCanvas(pageNo);
        context = canvas.getContext('2d');
        img = new Image();
        img.onload = (function(_this) {
            return function() {
                _this.log("Canvas redrawn");
                context.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                return _this.eventBus.emitEvent('canvasRedrawn', [pageNo]);
            };
        })(this);
        return img.src = snapShot;
    },
    clearCanvas: function(pageNo) {
        var canvas, context;
        canvas = this.getCanvas(pageNo);
        context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        //return canvas.width = canvas.width;
    },
    setupCanvasBrush: function(pageNo) {
        var canvas, context, radius;
        this.clearCanvas(pageNo);
        canvas = this.getCanvas(pageNo);
        context = canvas.getContext('2d');
        context.lineJoin = "round";
        radius = 5;
        return context.lineWidth = radius;
    },
    drawAnnotation: function(currentPoint, nextPoint) {
        var canvas, context;
        canvas = this.getCanvas(currentPoint.page);
        context = canvas.getContext('2d');
        context.beginPath();
        context.moveTo(currentPoint.x, currentPoint.y);
        context.lineTo(nextPoint.x, nextPoint.y);
        context.closePath();
        context.strokeStyle = this.drawingColor;
        return context.stroke();
    },
    processMouseEvent: function(event) {
        var offsetLeft, offsetTop, page, pos_x, pos_y, target;
        target = void 0;
        if (event.target) {
            target = event.target;
        } else {
            if (event.srcElement) {
                target = event.srcElement;
            }
        }
        if (!this.isTextLayerId(target.id)) {
            return;
        }
        page = parseInt(this.getPageFromTextLayer(target.id));
        pos_x = void 0;
        pos_y = void 0;
        if (event.offsetX) {
            pos_x = window.event.offsetX;
            pos_y = window.event.offsetY;
        } else {
            offsetLeft = target.offsetLeft;
            offsetTop = target.offsetTop;
            if (event.layerX < target.offsetLeft) {
                offsetLeft = offsetTop = 0;
            }
            pos_x = event.layerX - offsetLeft;
            pos_y = event.layerY - offsetTop;
        }
        return {
            page: page,
            x: pos_x,
            y: pos_y
        };
    },
    isTextLayerId: function(id) {
        return id.indexOf("textLayer") !== -1;
    },
    getPageFromTextLayer: function(id) {
        return id.substring(id.lastIndexOf("-") + 1, id.length);
    },
    log: function(msg) {
        return viewerNS.Util.Logger.log(msg);
    },
    cleanup: function(){
        var allPagesContainer = this.getAllPagesContainer();
        if(allPagesContainer && allPagesContainer.childNodes){
            var childNodes = allPagesContainer.childNodes;
            for (var i = childNodes.length - 1; i >= 0; i--) {
                var node = childNodes[i];
                allPagesContainer.removeChild(node);
            }
        }
        var thumbnailsContainer = this.getThumbnailsContainer();
        if(thumbnailsContainer && thumbnailsContainer.childNodes){
            childNodes = thumbnailsContainer.childNodes;
            for (i = childNodes.length - 1; i >= 0; i--) {
                node = childNodes[i];
                thumbnailsContainer.removeChild(node);
            }
        }
        if(this.textLayer){
            while(this.textLayer.length > 0) {
                this.textLayer.pop();
            }
        }
    }
});


/**
 * Content Viewer - main class for Viewer creation
 * http://www.w3schools.com/js/js_conventions.asp
 */

//TODO - Use Class.js instead of jclass - more transparent handling of namespaces


viewerNS.ContentViewer = JClass._extend({

    init: function(config){
        var clientConfig;
        config.viewerId = config.renderTo;

        clientConfig = viewerNS.Util.DomUtility.clone(config);
        this.eventBus = new EventEmitter();
        this.initializeConfig(clientConfig);
        this.convertRelativeUrls(clientConfig);
        this.initViews(clientConfig);
        this.clientConfig = clientConfig;
        this.initControllers(clientConfig); 
        if(clientConfig.loadLater || (!clientConfig.fullDocumentUrl && !clientConfig.pageServingUrl)){
            //this.clientConfig = clientConfig;
            //log here
        }
        else {            
            this.mainController.loadDocument();           
        }
    },

    /**
    * Load document
    *
    */
    load: function(urlConfig) {
        var urls = viewerNS.Util.DomUtility.clone(urlConfig);
        this.convertRelativeUrls(urls);
        this.clientConfig = viewerNS.Util.DomUtility.merge(this.clientConfig, urls);
        if (typeof this.toolbar.reset === "function") {
            this.toolbar.reset();
        }
        this.mainController.reset();
        this.mainController.loadDocument(urls);
    },

    convertRelativeUrls: function (urlConfig) {
        if (urlConfig.fullDocumentUrl) {
            urlConfig.fullDocumentUrl = viewerNS.Util.convertRelToAbsUrl(urlConfig.fullDocumentUrl);
        }
        if (urlConfig.pageServingUrl) {
            urlConfig.pageServingUrl = viewerNS.Util.convertRelToAbsUrl(urlConfig.pageServingUrl);
        }
        if (urlConfig.fallbackUrl) {
            urlConfig.fallbackUrl = viewerNS.Util.convertRelToAbsUrl(urlConfig.fallbackUrl);
        }

        return urlConfig;
    },

    initializeConfig: function(config){
        viewerNS.Util.initializeConfig(config, this);
        if(config.templateHandler){
            viewerNS.Util.TemplateManager.overrideTemplateHandler(config.templateHandler);
        }
    },

    initPageView: function () {
        this.pageView = new viewerNS.PageView({
                viewerId: this.viewerId,
                viewerContainerId: this.viewerContainerId,
                id: "" + this.viewerId + "-viewerPageView",
                eventBus: this.eventBus
            }
        );
    },

    initHtml: function () {
        viewerNS.Util.DomUtility.append(this.viewerId, this.viewerContainerHtml);
        this.viewerContainer = viewerNS.Util.DomUtility.getElement(this.viewerContainerId);
    },

    initViewContainer: function () {
        this.viewerContainerId =  this.viewerId + '-wrapper';
        this.viewerContainerHtml = '<div class="viewer-wrapper" id="'+ this.viewerContainerId +'"></div>';
        viewerNS.Util.DomUtility.documentReady(this.initHtml.bind(this));
    },

    initViews: function (config) {
        this.initViewContainer();
        config.viewerContainerId = this.viewerContainerId;
        this.initUserActionElements(config);
        this.initPageView();
    },

    initUserActionElements: function (config) {
        if (this.externalToolbar === true) {
            this.toolbar = new viewerNS.UserActionElements(this.viewerId, config, this.eventBus);
        } else {
            this.toolbar = new viewerNS.DefaultToolbar(config, this.eventBus);
        }

    },

    initControllers: function (config) {
        this.mainController = new viewerNS.MainController(config, this.eventBus, this.pageView);
        this.zoomController = new viewerNS.ZoomUIController(config, this.eventBus, this.toolbar);
        this.thumbnailController = new viewerNS.ThumbnailController(config, this.eventBus, this.pageView);
        this.searchController = new viewerNS.SearchController(config, this.eventBus, this.mainController);
        this.mainController.setSearchController(this.searchController);
        this.mainController.setThumbnailController(this.thumbnailController);
    },

    destroyViewer: function() {
        this.eventBus.emitEvent(this.viewerId + 'destroy');
    }

});

/*
 var mozL10n = document.mozL10n || document.webL10n;

var locale = PDFJS.locale || navigator.language;
var hashParams = PDFViewerApplication.parseQueryString(hash);

if ('locale' in hashParams) {
    locale = hashParams['locale'];
}
 mozL10n.setLanguage(locale);

*/

