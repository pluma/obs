(function(root){
var module = {exports: {}};
(function(require, exports, module) {
/*jshint es3: true */
/*global module */
'use strict';
function PubSub() {
  this._subscribers = [];
}

PubSub.prototype = {
  subscribe: function(fn, ctx) {
    var self = this;
    function callback() {
      return fn.apply(ctx || self, arguments);
    }
    callback.fn = fn;
    callback.ctx = ctx;
    this._subscribers.push(callback);
  },
  unsubscribe: function (fn, ctx) {
    for (var i = 0; i < this._subscribers.length; i++) {
      if (this._subscribers[i].fn !== fn || this._subscribers[i].ctx !== ctx) continue;
      this._subscribers.splice(i, 1);
      return true;
    }
    return false;
  },
  publish: function() {
    var args = Array.prototype.slice.call(arguments, 0);
    for (var i = 0; i < this._subscribers.length; i++) {
      this._subscribers[i].apply(this, args);
    }
  }
};

module.exports = function () {
  return new PubSub();
};

module.exports.PubSub = PubSub;
}(function(key){return root[key];}, module.exports, module));
root.sublish = module.exports;
}(this));