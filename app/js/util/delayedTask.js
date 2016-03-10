/**
 * Delayed task runner
 */
viewerNS.DelayedTask = JClass._extend({
    init: function(fn, scope, args, cancelOnDelay) {
        var me = this,
            delay,
            call = function() {
                clearInterval(me.id);
                me.id = null;
                fn.apply(scope, args || []);
            };

        cancelOnDelay = typeof cancelOnDelay === 'boolean' ? cancelOnDelay : true;

        me.delay = function(newDelay, newFn, newScope, newArgs) {
            if (cancelOnDelay) {
                me.cancel();
            }
            delay = newDelay || delay;
            fn = newFn || fn;
            scope = newScope || scope;
            args  = newArgs  || args;
            if (!me.id) {
                me.id = setInterval(call, delay);
            }
        };

        /**
         * Cancel the last queued timeout
         */
        me.cancel = function() {
            if (me.id) {
                clearInterval(me.id);
                me.id = null;
            }
        };
    }
});
