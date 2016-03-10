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