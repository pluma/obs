# Synopsis

**obs** is a lightweight (~0.7 kB gzipped, ~1.1 kB with all dependencies) implementation of observable properties that can be used on both the client-side and the server-side.

Together with [rivets.js](http://rivetsjs.com) it can serve as a lightweight alternative to [Knockout.js](http://knockoutjs.com).

# Install

## Node.js

### With NPM

```sh
npm install obs
```

### From source

```sh
git clone https://github.com/pluma/obs.js.git
cd obs.js
npm install
make && make min
```

## Browser

### With component

```sh
component install pluma/obs.js
```

[Learn more about component](https://github.com/component/component).

### Using an AMD or CommonJS module loader

Get the [latest minified release](https://raw.github.com/pluma/obs.js/master/lib/obs.min.js). Make sure you also have a compatible copy of [aug](https://github.com/jgallen23/aug) and [sublish](https://github.com/pluma/sublish).

### As standalone bundle

Get the [latest distribution bundle](https://raw.github.com/pluma/obs.js/master/dist/obs.all.min.js) (~3.1 kB or ~1.1 kB gzipped, includes [aug 0.0.5](https://github.com/jgallen23/aug/tree/0.0.5) and [sublish 0.2.0](https://github.com/pluma/sublish/tree/0.1.0)) and download it to your project.

You can then include the bundle with a script tag. If you are using an AMD module loader on the same page, make sure to load it _after_ the script tag to avoid conflicts.

```html
<script src="/your/js/path/obs.all.min.js"></script>
```

If you want to use `obs` in [legacy browsers](http://kangax.github.com/es5-compat-table/#showold) (e.g. IE 8 and lower) make sure to use an EcmaScript 5 polyfill like [augment.js](http://augmentjs.com) because this library makes use of JavaScript functions not available in EcmaScript 4 and lower.

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

# Client-side example with [rivets.js](http://rivetsjs.com) data-binding

Try it on [jsfiddle](http://jsfiddle.net/QdLxc/).

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

## prop: Observable properties

### prop([initialValue])

Creates an observable property (optionally initialised with the given value).

### prop#()

Returns the property's current value.

### prop#(newValue)

Sets the property's value to `newValue`. Notifies all subscribers with the new and old value.

### prop#subscribe(callback:Function)

Adds the given callback function to this property's list of subscribers.

The callback will be called with the property's new and old value as its arguments whenever the property is set to a new value (even if the new value is equal to the old value).

### prop#unsubscribe(callback:Function):Boolean

Removes the given callback function from this property's list of subscribers. The callback will no longer be called when the property's value changes.

Returns `false` if the callback could not be found in the list of subscribers or `true` otherwise.

**NOTE:** Remember to use the exact function that was passed to `prop#subscribe`.

### prop#reset()

Resets the property to its initial value (or `undefined`).

### prop.fn

An object containing attributes that will be applied to new observable properties.

## computed: Computed observables

### computed(fn:Function, dependencies:Array, [lazy:Boolean])

Creates a computed observable property. The property's value will be set to the return value of the given function `fn` and updated whenever any of the given `dependencies` changes.

If `lazy` is set to `true` (default: `false`), updating of the property's new value will be delayed until the first time the property is called. This also means subscribers will not be notified until the property is called directly.

The list of dependencies can be an array containing any kind of object that supports the `subscribe` and (optionally) `unsubscribe` methods (e.g. an instance of `sublish.PubSub`). If a single object is passed instead of an array, the object will automatically be wrapped in an array.

### computed#()

Returns the computed property's current value. For lazy computed observables, this will trigger the function evaluation and notify any subscribers.

### computed#subscribe(callback:Function)

Adds the given callback function to this property's list of subscribers. See `prop#subscribe`.

### computed#unsubscribe(callback:Function)

Removes the given callback function from this property#s list of subscribers. See `prop#unsubscribe` .

### computed#peek()

Returns the comnputed property's current value. Unlike `computed#()` this will not trigger the function evaluation in lazy computed observables.

### computed#watch(dependencies…)

Adds the given objects as dependencies. The passed objects should support the `subscribe` method and optionally support the `unsubscribe` method.

### computed#unwatch(dependencies…)

Removes the given objects from the computed property's dependencies after calling their `unsubscribe` methods, if possible.

### computed#dismiss()

Removes all of the computed property's dependencies. Equivalent to calling `computed#unwatch` for each dependency.

### computed.fn

An object containing attributes that will be applied to new computed observable properties.

# Acknowledgements

This library was heavily inspired by [Steve Sanderson's knockout.js project](https://github.com/SteveSanderson/knockout).

# License

The MIT/Expat license.
