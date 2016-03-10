/**
 * Jasmine tests
 */

"use strict";

describe("Viewer suite", function(){
    var viewerClientDivId = "ecd-viewer-test";
    var viewerInstance;
    var pdfUrl = "/test-data/compressed.tracemonkey-pldi-09.pdf";
    var pdfFalsyUrl = "nothing.pdf";
    var WAIT_SHORT = 500; //
    var WAIT_REGULAR = 3000;
    var WAIT_LONG = 4500;

    beforeEach(function(){
        var viewerClientDiv = document.createElement('div');
        viewerClientDiv.id = viewerClientDivId;

        viewerNS.Util.DomUtility.applyStyles(viewerClientDiv, {
            width: 900 + 'px',
            height: 600 + 'px'
        });

        document.body.appendChild(viewerClientDiv);

        viewerInstance = new emc.content.viewer.ContentViewer({
            locale:'',
            format: "pdf",
            renderTo:viewerClientDivId,
            externalToolbar: false,
            totalPageCount: 12,
            downloaderPath: "base/app/js/download/downloader.js",
            toolbarPath: "base/app/templates/toolbar.html",
            pdfJsWorkerPath: "base/app/js/libs/bower/pdfjs-dist/build/pdf.worker.js",
            loadLater: true
        });

        viewerInstance.mainController.disableTextContent = true;

    });

    afterEach(function() {
        viewerInstance.destroyViewer();
        var viewerClientDiv = document.getElementById(viewerClientDivId);
        document.body.removeChild(viewerClientDiv);
    });

    describe("Viewer init:", function() {
        it("initializes event bus and dom utility", function(){
            expect(emc.content.viewer).toBeDefined();

            expect(window.jQuery).toBeDefined();
            expect(viewerInstance.eventBus).toBeDefined();
            expect(viewerInstance.mainController).toBeDefined();
        });

        it("Page view is initialized", function() {
            expect(viewerInstance.pageView).toBeDefined();
            expect(viewerInstance.pageView.pagesContainerId).toBe(viewerInstance.viewerId + '-contents');

            var pageContainerEl = document.getElementById(viewerInstance.pageView.pagesContainerId);
            expect(pageContainerEl).toBeDefined();
        });

        it("Toolbar is initialized", function() {
            expect(viewerInstance.toolbar).toBeDefined();
            expect(viewerInstance.toolbar.toolbarWrapper).toBeDefined();
            expect(viewerInstance.toolbar.toolbarWrapper.id).toBe(viewerInstance.viewerId + '-toolbar');

            var toolbarWrapperEl = document.getElementById(viewerInstance.toolbar.toolbarWrapper.id);
            expect(toolbarWrapperEl).toBeDefined();
        });

        //describe("Loading", function(){
        it("initalizes mainController, downloader and pageView and raises event for downloader", function() {
            viewerInstance.load({
                fullDocumentUrl:pdfFalsyUrl
            });
            expect(viewerInstance.mainController).toBeDefined();
            expect(viewerInstance.mainController.downloader).toBeDefined();
            expect(viewerInstance.mainController.pageView).toBeDefined();
            expect(viewerInstance.mainController.pageView.id).toBe(viewerInstance.pageView.id);
        });

        it("fires downloadFullContent once", function() {
            var eventBus = viewerInstance.eventBus;
            var eventBusEmitSpy = spyOn(eventBus, 'emitEvent').and.callThrough();
            var urlConfig = {
                fullDocumentUrl:pdfFalsyUrl
            };

            var absoluteUrls = viewerInstance.convertRelativeUrls(urlConfig);
            viewerInstance.load(urlConfig);
            expect(eventBus.emitEvent).toHaveBeenCalledWith(
                'downloadFullContent', [viewerInstance.mainController.extractUrlConfig(absoluteUrls)]);
            expect(eventBus.emitEvent.calls.count()).toEqual(1);
        });

        it("converts relative urls to absolute", function() {
            var urlConfig = {
                fullDocumentUrl:pdfFalsyUrl,
                fallbackUrl:pdfFalsyUrl,
                pageServingUrl:pdfFalsyUrl
            };
            viewerInstance.convertRelativeUrls(urlConfig);
            expect(urlConfig.fullDocumentUrl).toContain("http://localhost:");
            expect(urlConfig.fallbackUrl).toContain("http://localhost:");
            expect(urlConfig.pageServingUrl).toContain("http://localhost:");
        });

        it("main controller instantiates page store with given page count", function() {
            var urlConfig = {
                fullDocumentUrl:pdfFalsyUrl
            };
            var configWithUrls = viewerNS.Util.DomUtility.merge(viewerInstance.clientConfig, urlConfig);
            var mainController = new viewerNS.MainController(configWithUrls, viewerInstance.eventBus, viewerInstance.pageView);
            mainController.disableTextContent = true;
            expect(mainController.pageStore).toBeDefined();
            expect(mainController.pageStore.storeId).toBe(viewerInstance.viewerId+ "-pageStore");
            expect(mainController.pageStore.getCount()).toBe(0);
            mainController.loadDocument();
            expect(mainController.pageStore.getCount()).toBe(viewerInstance.totalPageCount);

        });

        it("main controller instantiates page store with right status", function() {
            var urlConfig = {
                fullDocumentUrl:pdfFalsyUrl
            };
            var configWithUrls = viewerNS.Util.DomUtility.merge(viewerInstance.clientConfig, urlConfig);
            var mainController = new viewerNS.MainController(configWithUrls, viewerInstance.eventBus, viewerInstance.pageView);
            mainController.disableTextContent = true;
            var allIsWell = true;
            var pageStore = mainController.pageStore;
            pageStore.each(
                function(page) {
                    if (page.get('renderingStatus') !== pageStore.NOT_RENDERED ||
                        page.get('downloadStatus') !== pageStore.NOT_DOWNLOADED) {
                        allIsWell = false;
                    }
                }
            );
            expect(allIsWell).toBe(true);
        });

        it("main controller sets pdfjs worker path to configured path and enable worker", function() {
            var urlConfig = {
                fullDocumentUrl:pdfFalsyUrl
            };
            var configWithUrls = viewerNS.Util.DomUtility.merge(viewerInstance.clientConfig, urlConfig);
            var mainController = new viewerNS.MainController(configWithUrls, viewerInstance.eventBus, viewerInstance.pageView);
            mainController.disableTextContent = true;
            expect(mainController.pdfJsWorkerPath).toBeDefined();
            expect(mainController.pdfJsWorkerPath).not.toBe(mainController.PDFJS_WORKER_PATH);
            expect(mainController.pdfJsWorkerPath).toBe(viewerInstance.clientConfig.pdfJsWorkerPath);
            expect(PDFJS.workerSrc).toBe(viewerInstance.clientConfig.pdfJsWorkerPath);
            expect(PDFJS.disableWorker).toBe(false);

        });
    });

    describe("Document downloader:", function() {

        it("main controller instantiates downloader with configured web worker path", function() {
            var urlConfig = {
                fullDocumentUrl:pdfFalsyUrl
            };
            var configWithUrls = viewerNS.Util.DomUtility.merge(viewerInstance.clientConfig, urlConfig);
            var mainController = new viewerNS.MainController(configWithUrls, viewerInstance.eventBus, viewerInstance.pageView);
            mainController.disableTextContent = true;
            expect(mainController.downloader).toBeDefined();
            expect(mainController.downloader.downloaderPath).not.toBe(mainController.downloader.DOWNLOADER_PATH);
            expect(mainController.downloader.downloaderPath).toBe(viewerInstance.clientConfig.downloaderPath);
        });

        it("main controller gets downloader to download document", function(done){
            var urlConfig = {
                fullDocumentUrl:pdfUrl
            };
            var configWithUrls = viewerNS.Util.DomUtility.merge(viewerInstance.clientConfig, urlConfig);
            var newEventBus = new EventEmitter();
            var mainController = new viewerNS.MainController(viewerInstance.clientConfig, newEventBus, viewerInstance.pageView);
            mainController.disableTextContent = true;

            spyOn(mainController.downloader, "downloadWithWorker").and.callThrough();
            spyOn(mainController.downloader, 'handleDownloadedDoc').and.callThrough();
            mainController.loadDocument(urlConfig);

            expect(mainController.downloader.downloadWithWorker.calls.count()).toBe(1);
            setTimeout(function() {
                expect(mainController.downloader.handleDownloadedDoc.calls.count()).toBe(1);
                done();
            }, WAIT_REGULAR);
        });   

        it("main controller updates page store entries and setupAllView to render after document downloaded", function(done){
            var urlConfig = {
                fullDocumentUrl:pdfUrl
            };
            var configWithUrls = viewerNS.Util.DomUtility.merge(viewerInstance.clientConfig, urlConfig);
            var newEventBus = new EventEmitter();
            var mainController = new viewerNS.MainController(configWithUrls, newEventBus, viewerInstance.pageView);
            mainController.disableTextContent = true;
            spyOn(mainController, 'processPdfData').and.callThrough();
            spyOn(mainController, 'createPageStoreEntries').and.callThrough();
            spyOn(mainController, 'setupAllView').and.callThrough(); //resizeView check?
            spyOn(mainController, 'renderView');
            mainController.loadDocument();

            setTimeout(function() {
                expect(mainController.processPdfData).toHaveBeenCalled();
                expect(mainController.createPageStoreEntries).toHaveBeenCalledWith();
                expect(mainController.setupAllView).toHaveBeenCalled();
                expect(mainController.renderView).toHaveBeenCalled();
                var randomRecordNum = Math.floor((Math.random() * 10) + 1);
                expect(mainController.pageStore.getAt(randomRecordNum - 1).get('downloadStatus')).toBe(mainController.pageStore.DOWNLOADED);

                done();
            }, WAIT_REGULAR);
        });
    });

    describe("View init:", function() {

        it("instantiates default toolbar", function() {
            expect(viewerInstance.toolbar instanceof viewerNS.DefaultToolbar).toBe(true);
        }); 

        it("finds pages from document that can be displayed in the view area on load", function(done) {
            //findVisiblePages
            var mainController = viewerInstance.mainController;
            spyOn(mainController, 'findVisiblePages').and.callThrough();
            spyOn(mainController, 'renderView').and.callThrough();
            viewerInstance.load({
                fullDocumentUrl:pdfUrl
            });

            setTimeout(function() {
                expect(mainController.findVisiblePages().start).toBe(0);
                expect(mainController.findVisiblePages().end).toBe(1);
                expect(mainController.renderView).toHaveBeenCalled();
                expect(mainController.pageStore.getAt(0).get('renderingStatus')).not.toBe(mainController.pageStore.DOWNLOADED);
                expect(mainController.pageStore.getAt(0).get('renderingStatus')).not.toBe(mainController.pageStore.NOT_RENDERED);
                var firstPageRenderingStatus = mainController.pageStore.getAt(0).get('renderingStatus');
                expect(firstPageRenderingStatus === mainController.pageStore.RENDERING ||
                    firstPageRenderingStatus === mainController.pageStore.RENDERED).toBeTruthy();

                done();
            }, WAIT_REGULAR);
        });
    });

    describe("Navigation:", function() {

        var originalTimeout;
        beforeEach(function() {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        });


        afterEach(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });

        it('initializes document and fires event to indicate load of first visible pages', function(done) {
            var viewerDocInitEvent = viewerInstance.viewerId + viewerInstance.mainController.PAGE_RENDER_COMPLETE;

            spyOn(viewerInstance.eventBus, 'emitEvent').and.callThrough();
            viewerInstance.load({
                fullDocumentUrl:pdfUrl
            });

            setTimeout(function() {
                expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                    viewerDocInitEvent, [1]);
                done();
            }, WAIT_REGULAR);
        });

        it("scrolls to last page and renders it", function( done ){
            var viewerDocInitEvent = viewerInstance.viewerId + viewerInstance.mainController.PAGE_RENDER_COMPLETE;
            var mainController = viewerInstance.mainController;
            var pagesDiv =  viewerInstance.pageView.getAllPagesContainer();

            spyOn(viewerInstance.eventBus, 'emitEvent').and.callThrough();

            viewerInstance.load({
                fullDocumentUrl:pdfUrl
            });

            setTimeout(function() {
                expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                    viewerDocInitEvent, [1]);

                setTimeout(function() {
                    var lastPageNumber = mainController.pageStore.getCount();
                    expect(mainController.findVisiblePages().start).toBe(lastPageNumber - 1);
                    expect(mainController.findVisiblePages().end).toBe(lastPageNumber - 1);
                    expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                        viewerDocInitEvent, [lastPageNumber]);
                    done();

                }, WAIT_SHORT);

                pagesDiv.scrollTop = pagesDiv.scrollHeight;
            }, WAIT_REGULAR);
        });

        it("scrolls to random page number and renders the page", function( done ){
            var viewerDocInitEvent = viewerInstance.viewerId + viewerInstance.mainController.PAGE_RENDER_COMPLETE;
            var mainController = viewerInstance.mainController;
            var pagesDiv =  viewerInstance.pageView.getAllPagesContainer();

            spyOn(viewerInstance.eventBus, 'emitEvent').and.callThrough();

            viewerInstance.load({
                fullDocumentUrl:pdfUrl
            });

            setTimeout(function() {
                expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                    viewerDocInitEvent, [1]);
                var randomPageInDocument =
                    Math.floor((Math.random() * viewerInstance.mainController.totalPageCount) + 1);

                setTimeout(function() {
                    // tests indices rather than numbers - start at 0
                    var startIndex = randomPageInDocument -1;
                    expect(mainController.findVisiblePages().start).toBe(startIndex);
                    expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                        viewerDocInitEvent, [randomPageInDocument]);
                    done();

                }, WAIT_REGULAR);

                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'navigationRequest', [{pageNo:randomPageInDocument}]);
            }, WAIT_REGULAR);
        });

        it("scrolls to random page number and renders pages that can squeeze into view", function( done ){
            var viewerDocInitEvent = viewerInstance.viewerId + viewerInstance.mainController.PAGE_RENDER_COMPLETE;
            var mainController = viewerInstance.mainController;
            var pagesDiv =  viewerInstance.pageView.getAllPagesContainer();

            spyOn(viewerInstance.eventBus, 'emitEvent').and.callThrough();

            viewerInstance.load({
                fullDocumentUrl:pdfUrl
            });

            setTimeout(function() {
                expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                    viewerDocInitEvent, [1]);
                var randomPageInDocument =
                    Math.floor((Math.random() * viewerInstance.mainController.totalPageCount) + 1);

                setTimeout(function() {
                    // tests indices rather than numbers - start at 0
                    var startIndex = randomPageInDocument -1;
                    expect(mainController.findVisiblePages().start).toBe(startIndex);
                    //get the page at the index; find it's height; get the next page's height; add it;
                    //check if current scroll top + the added heights exceed the current scroll top + view height

                    var currentScrollTop = viewerInstance.pageView.currentScrollPosition();
                    var viewHeight = viewerInstance.pageView.getViewableHeight();
                    var pagesHeight = 0, pageIndex, endPage, totalPages = viewerInstance.mainController.totalPageCount;
                    //pagesHeight = mainController.pageStore.getAt(startIndex);
                    var data = mainController.pageStore.data,
                        dLen = data.length,
                        record, d;
                    for (d = startIndex; d < dLen; d++) {
                        record = data[d];
                        pagesHeight += record.get('zoomedHeight');
                        if((currentScrollTop + pagesHeight) > (currentScrollTop + viewHeight)){
                            endPage = record.get('pageId');
                            break;
                        }
                    }
                    //This is done to pre-empt user action and load the next page even if it is not in view
                    if(endPage == randomPageInDocument && randomPageInDocument != totalPages){
                        endPage++;
                    }
                    expect(mainController.findVisiblePages().end).toBe(endPage - 1);
                    var i;
                    for(i = randomPageInDocument; i <=endPage; i++ ){
                        expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                            viewerDocInitEvent, [i]);    
                    }
                    done();

                }, WAIT_REGULAR);

                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'navigationRequest', [{pageNo:randomPageInDocument}]);
            }, WAIT_REGULAR);
        });

        it("navigates to next page number and renders the page", function( done ){
            var viewerDocInitEvent = viewerInstance.viewerId + viewerInstance.mainController.PAGE_RENDER_COMPLETE;
            var mainController = viewerInstance.mainController;
            var pagesDiv =  viewerInstance.pageView.getAllPagesContainer();

            spyOn(viewerInstance.eventBus, 'emitEvent').and.callThrough();

            viewerInstance.load({
                fullDocumentUrl:pdfUrl
            });

            setTimeout(function() {
                expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                    viewerDocInitEvent, [1]);
                var nextPageInDoc = 2;

                setTimeout(function() {
                    // tests indices rather than numbers - start at 0
                    var startIndex = nextPageInDoc -1;
                    expect(mainController.findVisiblePages().start).toBe(startIndex);
                    expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                        viewerDocInitEvent, [nextPageInDoc]);
                    done();

                }, WAIT_SHORT);

                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'navigationRequest', [{relative:'next'}]);
            }, WAIT_REGULAR);
        });

        it("navigates to last page number and renders the page", function( done ){
            var viewerDocInitEvent = viewerInstance.viewerId + viewerInstance.mainController.PAGE_RENDER_COMPLETE;
            var mainController = viewerInstance.mainController;
            var pagesDiv =  viewerInstance.pageView.getAllPagesContainer();

            spyOn(viewerInstance.eventBus, 'emitEvent').and.callThrough();

            viewerInstance.load({
                fullDocumentUrl:pdfUrl
            });

            setTimeout(function() {
                expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                    viewerDocInitEvent, [1]);
                var lastPageInDoc = viewerInstance.mainController.totalPageCount;

                setTimeout(function() {
                    // tests indices rather than numbers - start at 0
                    var startIndex = lastPageInDoc -1;
                    expect(mainController.findVisiblePages().start).toBe(startIndex);
                    expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                        viewerDocInitEvent, [lastPageInDoc]);
                    done();

                }, WAIT_SHORT);

                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'navigationRequest', [{relative:'last'}]);
            }, WAIT_REGULAR);
        });

        it("navigates to last and then first page and renders the page", function( done ){
            var viewerDocInitEvent = viewerInstance.viewerId + viewerInstance.mainController.PAGE_RENDER_COMPLETE;
            var mainController = viewerInstance.mainController;
            var pagesDiv =  viewerInstance.pageView.getAllPagesContainer();

            spyOn(viewerInstance.eventBus, 'emitEvent').and.callThrough();

            viewerInstance.load({
                fullDocumentUrl:pdfUrl
            });

            setTimeout(function() {
                expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                    viewerDocInitEvent, [1]);
                var lastPageInDoc = viewerInstance.mainController.totalPageCount;

                setTimeout(function() {
                    var startIndex = lastPageInDoc -1;
                    expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                        viewerDocInitEvent, [lastPageInDoc]);

                    setTimeout(function() {
                        expect(mainController.findVisiblePages().start).toBe(0);
                        expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                            viewerDocInitEvent, [1]);
                        done();

                    }, WAIT_SHORT);
                    viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'navigationRequest', [{pageNo:1}]);                    

                }, WAIT_SHORT);

                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'navigationRequest', [{relative:'last'}]);
            }, WAIT_REGULAR);
        });

        it("navigates to next and then previous page and renders the page", function( done ){
            var viewerDocInitEvent = viewerInstance.viewerId + viewerInstance.mainController.PAGE_RENDER_COMPLETE;
            var mainController = viewerInstance.mainController;
            var pagesDiv =  viewerInstance.pageView.getAllPagesContainer();

            spyOn(viewerInstance.eventBus, 'emitEvent').and.callThrough();            

            viewerInstance.load({
                fullDocumentUrl:pdfUrl
            });

            setTimeout(function() {
                expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                    viewerDocInitEvent, [1]);

                setTimeout(function() {
                    var startIndex = 1;
                    /*expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                        viewerDocInitEvent, [2]);*/
                    expect(mainController.findVisiblePages().start).toBe(startIndex);

                    setTimeout(function() {
                        var previousPage = 1, previousPageInex= 0; 
                        expect(mainController.findVisiblePages().start).toBe(previousPageInex);                        
                        done();

                    }, WAIT_SHORT);
                    viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'navigationRequest', [{relative:'previous'}]);                    

                }, WAIT_SHORT);

                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'navigationRequest', [{relative:'next'}]);
            }, WAIT_REGULAR);
        });
    });

});

