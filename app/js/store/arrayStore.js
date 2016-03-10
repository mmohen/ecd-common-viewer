viewerNS.ArrayStore = viewerNS.Store._extend({
    init: function init(config){
        var fields = config.fields || this.fields;
        this.fields = this.isArrayType(fields) ? fields : [];
        //call parent
        init._super.call(this, config);
    }
});