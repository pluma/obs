/*! obs 0.11.2 Original author Alan Plum <me@pluma.io>. Released into the Public Domain under the UNLICENSE. @preserve */
define(function(require, exports, module) {
var PubSub = require('sublish').PubSub,
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

function ext(dest) {
    var srcs = slice.call(arguments, 1);
    for (var i = 0; i < srcs.length; i++) {
        var src = srcs[i];
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                dest[key] = src[key];
            }
        }
    }
    return dest;
}

function parseComputedConfig(args) {
    var config = args[0];
    if (typeof config === 'function') {
        config = {compute: args[0]};
        if (args.length > 1) {
            if (typeof args[1] === 'function') {
                config.write = args[1];
                if (args.length > 2) {
                    config.watch = args[2];
                }
            } else {
                config.watch = args[1];
            }
        }
    }
    return config;
}

function obs(config) {
    function observable(value) {
        if (arguments.length) {
            if (typeof observable.write === 'function') {
                observable.write.call(observable.context, value);
            } else {
                throw new Error('This observable cannot be written to!');
            }
        } else {
            if (typeof observable.read === 'function') {
                return observable.read.call(observable.context);
            } else {
                throw new Error('This observable cannot be read from!');
            }
        }
    }

    ext(observable, PubSub.prototype, {
        context: config.context || observable,
        read: config.read,
        write: config.write,
        onNotify: (function(onNotify) {
            return function() {
                onNotify.call(observable);
            };
        }(config.onNotify || function() {})),
        _initialValue: config.value,
        _currentValue: config.value,
        _previousValue: undefined,
        _subscriptions: []
    }, obs.fn);

    PubSub.apply(observable);

    if (config.watch) {
        observable.watch.apply(observable, (
            isArray(config.watch) ? config.watch : [config.watch]
        ));
    }

    return observable;
}

obs.fn = {
    __is_obs__: true,
    notify: function() {
        this.dirty = (this._currentValue === this._initialValue);
        this.publish(this._currentValue, this._previousValue);
    },
    peek: function() {
        return this._currentValue;
    },
    commit: function() {
        this._initialValue = this._currentValue;
        this.dirty = false;
    },
    reset: function() {
        this._previousValue = this._currentValue;
        this._currentValue = this._initialValue;
        this.notify();
    },
    watch: function() {
        var args = slice.call(arguments, 0), sub, i;
        for (i = 0; i < args.length; i++) {
            sub = args[i];
            if (contains(this._subscriptions, sub)) {
                continue;
            }
            if (sub && typeof sub.subscribe === 'function') {
                sub.subscribe(this.onNotify);
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
                sub.unsubscribe(this.onNotify);
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
};

obs.prop = function(initialValue) {
    return obs({
        read: function() {
            return this._currentValue;
        },
        write: function(value) {
            this._previousValue = this._currentValue;
            this._currentValue = value;
            this.notify();
        },
        value: initialValue
    });
};

obs.computed = function(config) {
    config = parseComputedConfig(arguments);

    var observable = obs(ext({}, config, {
        read: function() {
            return observable._currentValue;
        },
        onNotify: function() {
            this._previousValue = this._currentValue;
            this._currentValue = config.compute.call(this.context);
            this.notify();
        }
    }));

    if (config.compute) {
        observable._initialValue = config.compute.call(observable.context);
        observable._currentValue = observable._initialValue;
    }

    if (config.watch) {
        observable.watch.apply(observable, (
            isArray(config.watch) ? config.watch : [config.watch]
        ));
    }

    return observable;
};

obs.computed.lazy = function(config) {
    config = parseComputedConfig(arguments);

    var changed = true;
    var observable = obs(ext({}, config, {
        context: config.context,
        read: function() {
            if (changed) {
                changed = false;
                observable._previousValue = observable._currentValue;
                observable._currentValue = config.compute.call(this);
                observable.notify();
            }
            return observable._currentValue;
        },
        write: config.write,
        onNotify: function() {
            changed = true;
        },
        watch: config.watch
    }));

    return observable;
};

module.exports = obs;return module.exports;});
