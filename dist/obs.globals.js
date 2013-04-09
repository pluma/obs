/*! obs 0.4.0 Copyright (c) 2013 Alan Plum. MIT licensed. */
(function(root){var require=function(key){return root[key];},exports=(root.obs={});
var aug = require('aug'),
    sublish = require('sublish');

exports.prop = aug(
    function(initialValue) {
        function prop(value) {
            if (arguments.length) {
                if (typeof prop.validate === 'function') {
                    prop.validate(value);
                }
                prop._previousValue = prop._currentValue;
                prop._currentValue = value;
                prop.notify();
            } else {
                return prop._currentValue;
            }
        }

        sublish.PubSub(prop);

        aug(prop, {
            _initialValue: initialValue,
            _currentValue: initialValue,
            dirty: false
        }, exports.prop.fn);
        
        return prop;
    },
    {
        fn: {
            __is_obs__: true,
            notify: function() {
                this.dirty = (this._currentValue === this._initialValue);
                this.publish(this._currentValue, this._previousValue);
            },
            peek: function() {
                return this._currentValue;
            },
            dismiss: function() {/* noop */},
            reset: function() {
                this(this._initialValue);
            }
        }
    }
);

function lazyComputed(fn) {
    var changed = true;
    function computed() {
        computed._previousValue = computed._currentValue;
        if (changed) {
            computed._currentValue = fn();
            changed = false;
            computed.notify();
        }
        return computed._currentValue;
    }

    return aug(computed, {
        _initialValue: undefined,
        _onNotify: function() {
            changed = true;
        }
    });
}

function eagerComputed(fn) {
    var initialValue = fn();
    function computed() {
        return computed._currentValue;
    }
    return aug(computed, {
        _initialValue: initialValue,
        _onNotify: function() {
            this._previousValue = this._currentValue;
            this._currentValue = fn();
            this.notify();
        }.bind(computed)
    });
}

exports.computed = aug(
    function(fn, dependencies, lazy) {
        var computed = (lazy ? lazyComputed : eagerComputed)(fn);

        sublish.PubSub(computed);

        aug(computed, {
            _currentValue: computed._initialValue,
            _dependencies: []
        }, exports.computed.fn);


        if (dependencies) {
            if (Array.isArray(dependencies)) {
                computed.watch.apply(computed, dependencies);
            } else {
                computed.watch(dependencies);
            }
        }

        return computed;
    },
    {
        fn: {
            __is_obs__: true,
            notify: function() {
                this.dirty = (this._currentValue === this._initialValue);
                this.publish(this._currentValue, this._previousValue);
            },
            peek: function() {
                return this._currentValue;
            },
            watch: function() {
                Array.prototype.forEach.call(arguments, function(dep) {
                    if (dep && typeof dep.subscribe === 'function') {
                        dep.subscribe(this._onNotify);
                        this._dependencies.push(dep);
                    }
                }.bind(this));
            },
            unwatch: function() {
                var deps = Array.prototype.slice.call(arguments, 0),
                    allDeps = this._dependencies;

                deps.forEach(function(dep) {
                    if (dep && typeof dep.unsubscribe === 'function') {
                        dep.unsubscribe(this._onNotify);
                    }
                }.bind(this));

                this._dependencies = allDeps.filter(function(dep) {
                    return deps.indexOf(dep) === -1;
                });
            },
            dismiss: function() {
                this.unwatch.apply(this, this._dependencies);
            }
        }
    }
);
}(this));
