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

