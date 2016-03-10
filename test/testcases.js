/**
 * Jasmine tests
 */

"use strict";

describe("Viewer suite", function () {
    var viewerClientDivId = "ecd-viewer-test";
    var viewerInstance;
    //var pdfUrl = "/test-data/compressed.tracemonkey-pldi-09.pdf";
    var pdfUrl = "http://localhost:63342/virolk_RUENVIROLKL2C_9303_Common_Viewer/depot/Common/CommonViewer/test/samples/compressed.tracemonkey-pldi-09.pdf";
    var pdfFalsyUrl = "nothing.pdf";
    var WAIT_SHORT = 500; //
    var WAIT_REGULAR = 3000;
    var WAIT_LONG = 4500;

    beforeEach(function () {
        var viewerClientDiv = document.createElement('div');
        viewerClientDiv.id = viewerClientDivId;

        viewerNS.Util.DomUtility.applyStyles(viewerClientDiv, {
            width: 900 + 'px',
            height: 600 + 'px'
        });

        document.body.appendChild(viewerClientDiv);

        viewerInstance = new emc.content.viewer.ContentViewer({
            locale: '',
            format: "pdf",
            renderTo: viewerClientDivId,
            externalToolbar: false,
            totalPageCount: 12,
            downloaderPath: "base/app/js/download/downloader.js",
            toolbarPath: "base/app/templates/toolbar.html",
            pdfJsWorkerPath: "base/app/js/libs/bower/pdfjs-dist/build/pdf.worker.js",
            loadLater: true
        });

        viewerInstance.mainController.disableTextContent = true;

    });

    afterEach(function () {
        viewerInstance.destroyViewer();
        var viewerClientDiv = document.getElementById(viewerClientDivId);
        document.body.removeChild(viewerClientDiv);
    });

    describe("Zoom:", function () {

        var originalTimeout;
        beforeEach(function() {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        });

        afterEach(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });

        it("zooms in on first request", function (done) {
            var mainController = viewerInstance.mainController;
            var pagesDiv = viewerInstance.pageView.getAllPagesContainer();

            viewerInstance.load({
                fullDocumentUrl: pdfUrl
            });

            setTimeout(function () {
                var initialZoom = mainController.zoomScale;
                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'zoomInRequest');

                setTimeout(function () {
                    var resultZoom = mainController.zoomScale;
                    expect(resultZoom > initialZoom).toBeTruthy();
                    done();

                }, WAIT_SHORT);

            }, WAIT_REGULAR);

        });

        it("zooms out on first request", function (done) {
            var mainController = viewerInstance.mainController;

            viewerInstance.load({
                fullDocumentUrl: pdfUrl
            });

            setTimeout(function () {
                var initialZoom = mainController.zoomScale;
                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'zoomOutRequest');

                setTimeout(function () {
                    var resultZoom = mainController.zoomScale;
                    expect(resultZoom < initialZoom).toBeTruthy();
                    done();

                }, WAIT_SHORT);

            }, WAIT_REGULAR);

        });

        it("zooms in then zooms out to initial scale", function (done) {
            var mainController = viewerInstance.mainController;

            viewerInstance.load({
                fullDocumentUrl: pdfUrl
            });

            setTimeout(function () {
                var initialZoom = mainController.zoomScale;
                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'zoomInRequest');

                setTimeout(function () {
                    expect(mainController.zoomScale > initialZoom).toBeTruthy();

                    setTimeout(function () {
                        viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'zoomOutRequest');

                        setTimeout(function () {
                            var resultZoom = mainController.zoomScale;
                            expect(resultZoom).toBeCloseTo(initialZoom);
                            done();

                        }, WAIT_SHORT);

                    }, WAIT_REGULAR);

                }, WAIT_SHORT);

            }, WAIT_REGULAR);

        });

        it("zooms in then zooms out to initial scale", function (done) {
            var mainController = viewerInstance.mainController;

            viewerInstance.load({
                fullDocumentUrl: pdfUrl
            });

            setTimeout(function () {
                var initialZoom = mainController.zoomScale;
                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'zoomOutRequest');

                setTimeout(function () {
                    expect(mainController.zoomScale < initialZoom).toBeTruthy();

                    setTimeout(function () {
                        viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'zoomInRequest');

                        setTimeout(function () {
                            var resultZoom = mainController.zoomScale;
                            expect(resultZoom).toBeCloseTo(initialZoom);
                            done();

                        }, WAIT_SHORT);

                    }, WAIT_REGULAR);

                }, WAIT_SHORT);

            }, WAIT_REGULAR);

        });

    });

    describe("Navigation:", function () {

        var originalTimeout;
        beforeEach(function () {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        });

        afterEach(function () {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });

        it("navigates through all document and renders all pages", function (done) {
            var viewerDocInitEvent = viewerInstance.viewerId + viewerInstance.mainController.PAGE_RENDER_COMPLETE;
            var mainController = viewerInstance.mainController;
            var pagesDiv = viewerInstance.pageView.getAllPagesContainer();

            spyOn(viewerInstance.eventBus, 'emitEvent').and.callThrough();

            viewerInstance.load({
                fullDocumentUrl: pdfUrl
            });

            var lastPageNumber;

            var checkPage = function (pageNum) {
                var last = pageNum == lastPageNumber;
                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'navigationRequest', [{pageNo: pageNum}]);

                setTimeout(function () {
                    expect(mainController.findVisiblePages().start).toBe(pageNum - 1);
                    expect(mainController.findVisiblePages().end).toBe(last ? pageNum - 1 : pageNum);
                    expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(viewerDocInitEvent, [pageNum]);
                    if (last) {
                        done();
                    } else {
                        checkPage(pageNum + 1);
                    }
                }, WAIT_SHORT);

            };

            setTimeout(function () {
                expect(viewerInstance.eventBus.emitEvent).toHaveBeenCalledWith(
                    viewerDocInitEvent, [1]);
                lastPageNumber = mainController.pageStore.getCount();
                checkPage(2);
            }, WAIT_REGULAR);

        });

    });


    describe("Search:", function () {

        var originalTimeout;
        beforeEach(function() {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        });

        afterEach(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });

        it("finds word \"sample\" on third page", function (done) {
            var mainController = viewerInstance.mainController;
            var pagesDiv = viewerInstance.pageView.getAllPagesContainer();

            viewerInstance.load({
                fullDocumentUrl: pdfUrl
            });

            setTimeout(function () {
                var initialZoom = mainController.zoomScale;
                viewerInstance.eventBus.emitEvent(viewerInstance.viewerId + 'searchRequest', [{searchPhrase: 'sample'}]);

                setTimeout(function () {
                    var resultZoom = mainController.zoomScale;
                    expect(mainController.findVisiblePages().start).toBe(2);
                    done();
                }, WAIT_SHORT);

            }, WAIT_REGULAR);

        });

    });

});

