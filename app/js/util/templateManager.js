/**
 * Created by Michad on 1/23/2015.
 */

/**
 * Template manager class
 */
viewerNS.Util.TemplateManager = (function () {

    var defaultTemplateHandler;
    var templateHandler;
    templateHandler = defaultTemplateHandler = doT;

    this.compile = function(templateString, templateSettings, data) {
        return templateHandler.template(templateString, templateSettings, data);
    };

    this.overrideTemplateHandler = function(templateEngine) {
        templateHandler = templateEngine;
    };

    return this;
}());