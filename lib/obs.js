/**!
* obs.js 0.2.1 Minimalist observable properties.
* Copyright (c) 2012 Alan Plum
* Licensed under the MIT license.
**/
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
        this.publish = function(msg) {
            this._subscribers.forEach(function(subscriber) {
                subscriber(msg);
            });
        };
    };
    
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
            var _value = initialValue;
            
            function prop() {
                if (arguments.length) {
                    _value = arguments[0];
                    prop.publish(_value);
                } else {
                    return _value;
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
            
            var _value, _onNotify, computed;
            
            if (lazy === true) {
                var _changed = true;
                _value = void(0);
                _onNotify = function() {
                    _changed = true;
                };
                computed = function() {
                    if (_changed) {
                        _value = fn();
                        _changed = false;
                        computed.publish(_value);
                    }
                    return _value;
                };
            } else {
                _value = fn();
                _onNotify = function() {
                    _value = fn();
                    computed.publish(_value);
                };
                computed = function() {
                    return _value;
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
                return _value;
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
