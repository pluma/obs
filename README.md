# Synopsis

**obs** is a powerful implementation of observable properties that can be used on both the client-side and the server-side.

Together with [rivets.js](http://rivetsjs.com) it can serve as a lightweight alternative to [Knockout.js](http://knockoutjs.com).

[![stability 3 - stable](http://b.repl.ca/v1/stability-3_--_stable-yellowgreen.png)
](http://nodejs.org/api/documentation.html#documentation_stability_index) [![license - Unlicense](http://b.repl.ca/v1/license-Unlicense-lightgrey.png)](http://unlicense.org/)

[![browser support](https://ci.testling.com/pluma/obs.png)](https://ci.testling.com/pluma/obs)

[![Build Status](https://travis-ci.org/pluma/obs.png?branch=master)](https://travis-ci.org/pluma/obs) [![Coverage Status](https://coveralls.io/repos/pluma/obs/badge.png?branch=master)](https://coveralls.io/r/pluma/obs?branch=master) [![Dependencies](https://david-dm.org/pluma/obs.png?theme=shields.io)](https://david-dm.org/pluma/obs)

[![NPM status](https://nodei.co/npm/obs.png?compact=true)](https://npmjs.org/package/obs)

# Install

## Node.js

### With NPM

```sh
npm install obs
```

### From source

```sh
git clone https://github.com/pluma/obs.git
cd obs
npm install
make && make dist
```

## Browser

### With component

```sh
component install pluma/obs
```

[Learn more about component](https://github.com/component/component).

### With a CommonJS module loader

Download the [latest minified CommonJS release](https://raw.github.com/pluma/obs/master/dist/obs.min.js) and add it to your project.

Make sure you also have a compatible copy of [sublish](https://github.com/pluma/sublish).

[Learn more about CommonJS modules](http://wiki.commonjs.org/wiki/Modules/1.1).

### With an AMD module loader

Download the [latest minified AMD release](https://raw.github.com/pluma/obs/master/dist/obs.amd.min.js) and add it to your project.

Make sure you also have a compatible copy of [sublish](https://github.com/pluma/sublish).

[Learn more about AMD modules](http://requirejs.org/docs/whyamd.html).

### As standalone bundle

Get the [latest distribution bundle](https://raw.github.com/pluma/obs/master/dist/obs.all.min.js) (~3.7 kB minified or ~1.2 kB gzipped, includes [sublish 0.4.5](https://github.com/pluma/sublish/tree/0.4.5)) and download it to your project.

```html
<script src="/your/js/path/obs.all.min.js"></script>
```

This makes the `obs` module available in the global namespace.

If you are already using `sublish` in your project, you can download the [latest minified standalone release](https://raw.github.com/pluma/obs/master/dist/obs.globals.min.js) (~3.2 kB minified or ~1.1 kB gzipped) instead.

# Basic usage example with node.js

```javascript
var obs = require('obs');
var x = obs.prop(2),
    y = obs.prop(5),
    sum = obs.computed(function() {
        return x() + y();
    }, [x, y]),
    product = obs.computed(function() {
        return x() * y();
    }, [x, y]);

console.log('sum is currently ' + sum());
// 'sum is currently 7'
console.log('product is currently ' + product());
// 'product is currently 10'

sum.subscribe(function(value, old) {
    console.log('sum is now ' + value + ' (was: ' + old + ')');
});
product.subscribe(function(value, old) {
    console.log('product is now ' + value + ' (was: ' + old + ')');
});

x(3);
// 'sum is now 8 (was: 7)'
// 'product is now 15 (was: 10)'
console.log('sum is currently ' + sum());
// 'sum is currently 8'
y(8);
// 'sum is now 11 (was: 8)'
// 'product is now 24 (was: 15)'
```

# Example with writable computed observables

```javascript
var obs = require('obs');
var firstname = obs.prop('John'),
    lastname = obs.prop('Doe'),
    fullname = obs.computed({
        compute: function() {
            return firstname() + ' ' + lastname();
        },
        write: function(value) {
            var tokens = (value || '').split(' ');
            firstname(tokens[0]);
            lastname(tokens.slice(1).join(' '));
        },
        watch: [firstname, lastname]
    });
console.log(fullname()); // John Doe
fullname('Konrad von Zuse');
console.log(firstname()); // Konrad
console.log(lastname()); // von Zuse
```

# Client-side example with [rivets.js](http://rivetsjs.com) data-binding

Try it on [jsfiddle](http://jsfiddle.net/QdLxc/22/).

## HTML

```html
<div id="view">
    <label>
        Your name:
        <input data-rv-value="user.name"/>
    </label>
    <div data-rv-bgcolor="color">
        Hello <span data-rv-text="user.name"></span>!<br>
        The current UNIX time is: <span data-rv-text="now"></span>
    </div>
</div>
```

## CSS

```css
#view {
    font: 16px Verdana, Arial, sans-serif;
}
#view div {
    padding: 10px;
}
```

## JavaScript

### Utilities

```javascript
var colors = [
    'rgba(255,0,0,0.5)', 'rgba(255,255,0,0.5)',
    'rgba(0,255,0,0.5)', 'rgba(0,255,255,0.5)',
    'rgba(0,0,255,0.5)', 'rgba(255,0,255,0.5)'
];
function resolveKeypath(obj, keypath) {
    keypath.split('.').forEach(function(key) {
        if (key) {
            obj = obj[key];
        }
    });
    return obj;
}
```

### Rivets.js adapter and configuration
```javascript
rivets.configure({
    prefix: 'rv',
    adapter: {
        subscribe: function(obj, keypath, callback) {
            resolveKeypath(obj, keypath).subscribe(callback);
        },
        unsubscribe: function(obj, keypath, callback) {
            resolveKeypath(obj, keypath).unsubscribe(callback);
        },
        read: function(obj, keypath) {
            return resolveKeypath(obj, keypath)();
        },
        publish: function(obj, keypath, value) {
            resolveKeypath(obj, keypath)(value);
        }
    }
});

rivets.binders.bgcolor = function(el, value) {
    el.style.backgroundColor = value;
};
```

### ViewModel (using obs.js)

```javascript
var viewModel = {
    now: obs.prop(+new Date()),
    color: obs.prop(colors[0]),
    user: {
        name: obs.prop('User')
    }
};

var view = rivets.bind($('#view'), viewModel);

setInterval(function() {
    viewModel.now(+new Date());
    viewModel.color(colors[
        Math.floor(Math.random() * colors.length)
    ]);
}, 3000);
```

# API

## obs: Abstract observables

This provides the base functionality for observables. You probably want to use `obs.prop` and `obs.computed` instead of calling `obs` directly.

### obs(options)

Creates an observable.

#### options.context (optional)

The context the observable's `read` and `write` functions will be executed in.

Defaults to the observable instance if not explicitly set.

#### options.read:Function and options.write:Function (optional)

The functions to be called when the observable is read from or written to.

An error will be raised if the observable is read from but no `read` function was defined, or if it is written to and no `write` function was defined.

#### options.watched:Array (optional)

An array of objects this observable subscribes to. If the value is not an array, it will be wrapped in one. Each object should have a `subscribe` method and (optionally) an `unsubscribe` method.

#### options.onNotify:Function (optional)

Function to be called when an object the observable is watching changes. Defaults to the observable's `notify` method, effectively turning the observable into a relay.

### obs#()

Calls the observable's `read` function with its `context`.

### obs#(value)

Calls the observable's `write` function with its `context` and the given `value`.

### obs#subscribe(callback:Function)

Adds the given callback function to this observable's list of subscribers.

The callback will be called with the observable's new and old value as its arguments whenever the observable's value is updated (even if the new value is equal to the old value).

### obs#unsubscribe(callback:Function):Boolean

Removes the given callback function from this observable's list of subscribers. The callback will no longer be called when the observable's value changes.

Returns `false` if the callback could not be found in the list of subscribers or `true` otherwise.

**NOTE:** Remember to use the exact function that was passed to `obs#subscribe`.

### obs#peek()

Returns the observable's current value without invoking its `read` function.

### obs#commit()

Sets the observable's initial value to its current value and clears its `dirty` flag.

### obs#reset()

Resets the observable to its initial value (or `undefined`), then calls `notify()`.

### obs#notify()

Updates the observable's `dirty` flag, then notifies all subscribers with the its current and previous value.

### obs#watch(dependencies…)

Adds the given dependencies to this observable. Each dependency should have a `subscribe` and `unsubscribe` method. Whenever one of the dependencies changes, this observable's `onNotify` function will be called.

### obs#unwatch(dependencies…)

Removes the given dependencies by calling their `unsubscribe` methods. The observable will no longer be notified when their values change.

### obs#dismiss()

Removes all of the observable's dependencies. Equivalent to calling `obs#unwatch` for each dependency.

### obs.fn

An object containing attributes that will be applied to new observables.

## obs.prop: Observable properties

This provides a simple wrapper around `obs` useful for observables that should just act as a single value storage.

### obs.prop([initialValue])

Creates an observable property (optionally initialized with the given value).

### obs.prop#()

Returns the property's current value.

### obs.prop#(newValue)

Sets the property's current value to `newValue` and notifies all subscribers.

## obs.computed: Computed observables

This provides a simple wrapper around `obs` to create observables that depend on other observables and have values that should be computed dynamically, e.g. composite values of other observables.

### obs.computed(compute:Function, [write:Function], [watch:Array])

Creates a computed observable observable. The observable's value will be set to the return value of the given function `compute` and updated whenever any of the `watch` functions changes.

If `write` is passed, that function will be used when the computed observable is passed a value.

The list of `watch` functions can be an array containing any kind of object that supports the `subscribe` and (optionally) `unsubscribe` methods (e.g. an instance of `sublish.PubSub`).

### obs.computed(options)

Creates a computed observable property with the given options.

#### options.compute:Function (optional)

The function this computed observable will use to generate its value. If this option is not provided, the observable will be write-only.

#### options.write:Function (optional)

The function this computed observable will use when it is passed a value. If this option is not provided, the observable will be read-only.

#### options.watch:Array (optional)

See above. This option has no effect if no `read` function is provided. If a single object is passed instead of an array, the object will automatically be wrapped in an array.

#### options.context (optional)

The context the `compute` and `write` functions will be executed in. Defaults to the computed observable itself.

### obs.computed#()

Returns the computed property's current value. For lazy computed observables, this will trigger the function evaluation and notify any subscribers.

### obs.computed.lazy(compute:Function, [write:Function], [watched:Array])

See `obs.computed(…)`. The created observable will only call its `compute` function to update its value when it is explicitly read from.

### obs.computed.lazy(options)

See `obs.computed(options)` and above.

# Acknowledgements

This library was heavily inspired by [Steve Sanderson's knockout.js project](https://github.com/SteveSanderson/knockout).

# Unlicense

This is free and unencumbered public domain software. For more information, see http://unlicense.org/ or the accompanying [UNLICENSE](https://github.com/pluma/obs/blob/master/UNLICENSE) file.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/pluma/obs/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
