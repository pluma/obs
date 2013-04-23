/*! obs 0.7.0 Copyright (c) 2013 Alan Plum. MIT licensed. */
(function(root){var require=function(key){return root[key];},exports=(root.obs={});
var assimilate = require('assimilate'),
    PubSub = require('sublish').PubSub,
    slice = Array.prototype.slice,
    isArray = Array.isArray ? Array.isArray : function(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    },
    contains = Array.prototype.indexOf ? function(arr, el) {
        return !!~arr.indexOf(el);
    } : function(arr, el) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === el) {
                return true;
            }
        }
        return false;
    };


exports.prop = assimilate(function(initialValue) {
    function prop(value) {
        if (arguments.length) {
            prop._previousValue = prop._currentValue;
            prop._currentValue = value;
            prop.notify();
        } else {
            return prop._currentValue;
        }
    }

    assimilate(prop, PubSub.prototype, {
        _initialValue: initialValue,
        _currentValue: initialValue,
        dirty: false
    }, exports.prop.fn);

    PubSub.apply(prop);
    
    return prop;
}, {
    readOnly: function(initialValue) {
        function prop() {
            if (arguments.length) {
                throw new Error('This observable is read-only!');
            } else {
                return prop._currentValue;
            }
        }

        assimilate(prop, PubSub.prototype, {
            _initialValue: initialValue,
            _currentValue: initialValue,
            dirty: false
        }, exports.prop.fn);

        PubSub.apply(prop);

        return prop;
    },
    fn: {
        __is_obs__: true,
        notify: function() {
            this.dirty = (this._currentValue === this._initialValue);
            this.publish(this._currentValue, this._previousValue);
        },
        peek: function() {
            return this._currentValue;
        },
        reset: function() {
            this(this._initialValue);
        }
    }
});


function lazyComputed() {
    var changed = true;
    function computed() {
        if (arguments.length) {
            if (typeof computed.write !== 'function') {
                throw new Error('This observable is read-only!');
            }
            computed.write.apply(computed.context, arguments);
        } else {
            computed._previousValue = computed._currentValue;
            if (changed) {
                computed._currentValue = computed.read.call(computed.context);
                changed = false;
                computed.notify();
            }
            return computed._currentValue;
        }
    }
    return assimilate(computed, {
        _initialValue: undefined,
        _onNotify: function() {
            changed = true;
        }
    });
}


function eagerComputed(readFn, writeFn, context) {
    function computed() {
        if (arguments.length) {
            if (typeof computed.write !== 'function') {
                throw new Error('This observable is read-only!');
            }
            computed.write.apply(computed.context, arguments);
        } else {
            return computed._currentValue;
        }
    }
    return assimilate(computed, {
        _initialValue: readFn.apply(context === undefined ? computed : context),
        _onNotify: function() {
            computed._previousValue = computed._currentValue;
            computed._currentValue = computed.read.call(computed.context);
            computed.notify();
        }
    });
}


function writeOnlyComputed() {
    function computed() {
        if (arguments.length) {
            computed.write.apply(computed.context, arguments);
        } else {
            throw new Error('This observable is write-only!');
        }
    }
    computed._initialValue = undefined;
    return computed;
}


exports.computed = assimilate(function(readFn, writeFn, watched) {
    var lazy = false,
        context;
    if (arguments.length === 1 && typeof readFn === 'object') {
        writeFn = readFn.write;
        watched = readFn.watched;
        lazy = readFn.lazy;
        context = readFn.context;
        readFn = readFn.read;
        if (watched && !isArray(watched)) {
            watched = [watched];
        }
    } else if (arguments.length === 2 && isArray(writeFn)) {
        watched = writeFn;
        writeFn = undefined;
    }

    if (!readFn && !writeFn) {
        throw new Error('No read function and no write function provided!');
    }

    var computed = (
        readFn ? (
            lazy ? lazyComputed : eagerComputed
        )(readFn, writeFn, context) : writeOnlyComputed(writeFn)
    );

    assimilate(computed, PubSub.prototype, {
        _currentValue: computed._initialValue,
        read: readFn,
        write: writeFn,
        context: context === undefined ? computed : context,
        dirty: false,
        _subscriptions: []
    }, exports.computed.fn);

    PubSub.apply(computed);

    if (readFn && isArray(watched)) {
        computed.watch.apply(computed, watched);
    }

    return computed;
}, {
    lazy: function(readFn, writeFn, watched) {
        if (arguments.length === 1 && typeof readFn === 'object') {
            return exports.computed(assimilate({lazy: true}, readFn));
        } else if (arguments.length === 2 && isArray(writeFn)) {
            watched = writeFn;
            writeFn = undefined;
        }
        return exports.computed({
            read: readFn,
            write: writeFn,
            watched: watched,
            lazy: true
        });
    },
    fn: assimilate({}, exports.prop.fn, {
        watch: function() {
            var args = slice.call(arguments, 0),
                sub, i;
            for (i = 0; i < args.length; i++) {
                sub = args[i];
                if (contains(this._subscriptions, sub)) {
                    continue;
                }
                if (sub && typeof sub.subscribe === 'function') {
                    sub.subscribe(this._onNotify);
                    this._subscriptions.push(sub);
                }
            }
            return this;
        },
        unwatch: function() {
            var subs = slice.call(arguments, 0),
                allSubs = this._subscriptions,
                i, sub;

            for (i = 0; i < subs.length; i++) {
                sub = subs[i];
                if (sub && typeof sub.unsubscribe === 'function') {
                    sub.unsubscribe(this._onNotify);
                }
            }

            this._subscriptions = [];
            for (i = 0; i < allSubs.length; i++) {
                 sub = allSubs[i];
                 if (!contains(subs, sub)) {
                    this._subscriptions.push(sub);
                 }
            }
            return this;
        },
        dismiss: function() {
            this.unwatch.apply(this, this._subscriptions);
        }
    })
});
}(this));
