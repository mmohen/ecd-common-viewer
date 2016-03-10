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