/**
 * Dom functions utility class
 */
viewerNS.Util.DomUtility = (function () {

    this.documentReady = function(fn){
        $(document).ready(fn);
    };

    this.append = function(elem, html) {
        var element = this.getElement(elem);
        element.append(html);
    };

    this.getElement = function (elem, firstElement) {
        var element;
        if(typeof elem === 'string'){
            element = $("#" + elem);
        }
        else if(typeof elem === 'object'){
            if (elem.jquery) {
                element = elem;
            }
            else {
                element = $(elem);

            }
        }
        if (firstElement && element && element.length > 0) {
            element = element[0];
        }
        return element;
    };

    this.getBodyElement = function() {
        return $("body");
    };

    this.applyStyles = function(elem, jsonData) {
        this.getElement(elem).css(jsonData);
    };

    this.getWidth = function(elem) {
        var element;
        if(elem.length && elem.length > 0 ){
            element = elem[0];
        }
        return element.clientWidth;
    };

    function getDomElement(elem) {
        var element;
        if (elem.length && elem.length > 0) {
            element = elem[0];
        }
        return element;
    }

    this.getHeight = function(elem) {
        var element = getDomElement(elem);
        return element.clientHeight;
    };

    this.getScrollTop = function(elem) {
        var element = getDomElement(elem);
        return element.scrollTop;
    };

    this.setScrollTop = function(elem, value) {
        var element = getDomElement(elem);
        return element.scrollTop = value;
    };

    this.getScrollHeight = function(elem) {
        var element = getDomElement(elem);
        return element.scrollHeight;
    };

    this.ajaxRequest = function(url, params, callback){
        $.ajax.send(url, params, callback);
    };

    this.jqw = $;

    var NonWhitespaceRegexp = /\S/;

    this.isAllWhitespace = function(str) {
        return !NonWhitespaceRegexp.test(str);
    };

    this.clone = function(object, deep) {
        if(deep){
            return $.extend(true, {}, object);
        }
        else {
            return $.extend({}, object);
        }
        return !NonWhitespaceRegexp.test(str);
    };

    this.merge = function(obj1, obj2) {
        return $.extend({}, obj1, obj2);
    };

    return this;
}());
