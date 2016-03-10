/**
 * Store for records
 * WIP - adding functions as needed
 */
viewerNS.Store = JClass._extend({

    init: function(config){
        var data = config.data || this.data;
        this.storeId = config.storeId;
        this.initData(data);
        this.length = this.data.length;
    },

    initData: function (data) {
        this.data = [];
        if(this.isArrayType(data)) {
            this.addRecordsFromData(data);
        }
    },

    addRecordsFromData: function(objectData) {
        for (var i = 0; i < objectData.length; i++) {
            this.add(objectData[i]);
        }
    },

    isArrayType: function(object) {
        return !!(object && Object.prototype.toString.call(object) === '[object Array]');

    },

    getAt: function(index){
        return this.data.length > index ? this.data[index] : null;
    },

    getCount: function() {
        return this.data.length;
    },

    getRange: function(start, end){
        var extendedEnd = parseInt(end) + 1;
        return this.data.slice(start, extendedEnd);
    },

    each: function(fn, scope) {
        var data = this.data,
            dLen = data.length,
            record, d;

        for (d = 0; d < dLen; d++) {
            record = data[d];
            if (fn.call(scope || record, record, d, dLen) === false) {
                break;
            }
        }
    },

    add: function(item){
        this.data.push(new viewerNS.StoreRecord( item ));
    },

    clear: function() {
        while(this.data.length > 0) {
            this.data.pop();
        }
    }
});

/**
 * Store records
 */
viewerNS.StoreRecord = JClass._extend({
    init: function(config) {
        viewerNS.Util.initializeConfig(config, this);
    },

    get: function(propertyName){
        return this[propertyName];
    },

    set: function(propertyName, data) {
        this[propertyName] = data;
    }
});
