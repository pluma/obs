/*! obs.js 0.2.3 Copyright (c) 2012 Alan Plum. MIT licensed. */
(function(root, factory) {
    if (typeof exports === 'object') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory(root.obs = {});
    }
}(this, function(exports) {
    function PubSub() {
        this._subscribers = [];
        this.subscribe = function(fn) {
            this._subscribers.push(fn);
        };
        this.unsubscribe = function(fn) {
            var i = this._subscribers.indexOf(fn);
            if (i === -1) {
                return false;
            }
            this._subscribers.splice(i, 1);
            return true;
        };
        this.publish = function() {
            var args = arguments;
            this._subscribers.forEach(function(subscriber) {
                subscriber.apply(null, args);
            });
        };
    }
    
    function extend(obj) {
        var args = Array.prototype.slice.call(arguments, 1);
        
        args.forEach(function(src) {
            Object.keys(src).forEach(function(key) {
                obj[key] = src[key];
            });
        });
        
        return obj;
    }

    exports.util = {
        PubSub: PubSub,
        extend: extend
    };
    
    exports.prop = extend(
        function(initialValue) {
            var _currentValue = initialValue;
            
            function prop() {
                var oldValue = _currentValue;
                if (arguments.length) {
                    _currentValue = arguments[0];
                    prop.publish(_currentValue, oldValue);
                } else {
                    return _currentValue;
                }
            }
            
            PubSub.call(prop);
            extend(prop, exports.prop.fn);
            
            return prop;
        },
        {fn: {__is_obs__: true}}
    );
    
    exports.computed = extend(
        function(fn, dependencies, lazy) {
            if (!Array.isArray(dependencies)) {
                dependencies = [dependencies];
            }
            
            var _currentValue, _onNotify, computed;
            
            if (lazy === true) {
                var _changed = true;
                _currentValue = void(0);
                _onNotify = function() {
                    _changed = true;
                };
                computed = function() {
                    var oldValue = _currentValue;
                    if (_changed) {
                        _currentValue = fn();
                        _changed = false;
                        computed.publish(_currentValue, oldValue);
                    }
                    return _currentValue;
                };
            } else {
                _currentValue = fn();
                _onNotify = function() {
                    var oldValue = _currentValue;
                    _currentValue = fn();
                    computed.publish(_currentValue, oldValue);
                };
                computed = function() {
                    return _currentValue;
                };
            }

            computed.dismiss = function() {
                dependencies.forEach(function(obs) {
                    if (obs && typeof obs.unsubscribe === 'function') {
                        obs.unsubscribe(_onNotify);
                    }
                });
            };

            computed.peek = function() {
                return _currentValue;
            };
            
            PubSub.call(computed);
            extend(computed, exports.computed.fn);
            
            dependencies.forEach(function(obs) {
                if (obs && typeof obs.subscribe === 'function') {
                    obs.subscribe(_onNotify);
                }
            });
            
            return computed;
        },
        {fn: {__is_obs__: true}}
    );
}));
