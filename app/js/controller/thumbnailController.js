/**
 * Thumbnail Controller
 *
 */
viewerNS.ThumbnailController = JClass._extend({

    init: function (config, eventBus, pageView) {
        viewerNS.Util.initializeConfig(config, this);
        this.eventBus = eventBus;
        this.pageView = pageView;
        this.active = true;
        this.registerListeners();
        this.lastPageNavigated = 1;
    },

    addClickListener: function (elementId) {
        var me = this;
        viewerNS.Util.DomUtility.jqw('#' + elementId).click(function () {
            me.setPage(+this.getAttribute("data-pageNo"));
        });
    },

    setPage: function (pageNo) {
        this.eventBus.emitEvent(this.viewerId + 'navigationRequest', [{pageNo: pageNo}]);
    },

    registerListeners: function () {
        this.eventBus.addListener(this.viewerId + 'pageNavigated', this.onPageNavigated.bind(this));
    },

    onPageNavigated: function (pageNo) {
        if (this.lastPageNavigated && this.lastPageNavigated == pageNo) {
            return;
        }
        if (this.lastPageNavigated) {
            viewerNS.Util.DomUtility.jqw('#' + this.pageView.getThumbnailCanvasId(this.lastPageNavigated)).removeClass('thumbnail-selected');
        }
        viewerNS.Util.DomUtility.jqw('#' + this.pageView.getThumbnailCanvasId(pageNo)).addClass('thumbnail-selected');
        this.lastPageNavigated = pageNo;
        this.setThumbnailVisible(pageNo);
    },

    setThumbnailVisible: function (pageNo) {
        var start, end, container, thumbHeight;
        container = this.pageView.getThumbnailsContainer();
        thumbHeight = this.pageView.getThumbTotalHeight();
        start = (pageNo - 1) * thumbHeight;
        end = start + thumbHeight;
        if (end > container.scrollTop + container.clientHeight) {
            container.scrollTop = end - container.clientHeight;
        } else if (start < container.scrollTop) {
            container.scrollTop = start;
        }
    },

    log: function (msg) {
        return viewerNS.Util.Logger.log(msg);
    },

    debug: function (msg) {
        return viewerNS.Util.Logger.debug(msg);
    },

    destroy: function () {
    }

});
