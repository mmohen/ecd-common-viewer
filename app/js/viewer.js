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

