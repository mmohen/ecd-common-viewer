/**
 * Created by Michad on 1/19/2015.
 */
viewerNS.ViewerStore = viewerNS.ArrayStore._extend({
    DOWNLOADED: "downloaded",
    PARTIAL_DOWNLOADED: "partialDownloaded",
    NOT_DOWNLOADED: "notDownloaded",
    REQUEST_RENDER: "requestRender",
    REQUEST_PARTIAL_RENDER: "requestPartialRender",
    RENDERED: "renderingComplete",
    RENDERING: "rendering",
    PARTIAL_RENDERED: "partialRendered",
    NOT_RENDERED: "notRendered",

    fields: ['pageId', 'pageRef', 'heightOrig', 'widthOrig', 'zoom', 'rotate', 'renderingStatus', 'thumbRenderingStatus',
        'zoomedHeight', 'zoomedWidth', 'textContent', 'pageSnapshot', 'annotation', 'downloadStatus'],

    init: function init(config){
        //call parent
        init._super.call(this, config);
    }

});