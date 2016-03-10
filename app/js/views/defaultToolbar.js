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
