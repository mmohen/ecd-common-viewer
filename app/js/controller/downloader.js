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