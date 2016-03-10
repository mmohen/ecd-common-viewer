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
