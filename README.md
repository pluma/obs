# Synopsis

obs.js is a lightweight implementation of observable properties inspired by knockout.js.

# Install

## Node.js

```sh
    npm install obs
```

## Browser

Get the [latest minified release](https://github.com/pluma/obs.js/master/lib/obs.min.js) and download it to your project.

You can load the `obs` module with an AMD or CommonJS module loader or include the `obs` global directly with a script tag:

```html
    <script src="/your/js/path/obs.min.js"></script>
```

If you want to use `obs` in [legacy browsers](https://kangax.github.com/es5-compat-table/#showold) (e.g. IE 8 and lower) make sure to use an EcmaScript 5 polyfill like [augment.js](http://augmentjs.com) because this library makes use of JavaScript functions not available in EcmaScript 4 and lower.

## From Github

```sh
    git clone https://github.com/pluma/obs.js.git
    cd obs.js
    npm install
    make && make min
```

# Usage example

```javascript
    require(['obs'], function(obs) {
        var x = obs.prop(2),
            y = obs.prop(5),
            sum = obs.computed(function() {
                return x() + y();
            }, [x, y]),
            product = obs.computed(function() {
                return x() * y();
            }, [x, y]);
        console.log(sum());
        // 7
        console.log(product());
        // 10
        sum.subscribe(console.log.bind(console, 'sum is now'));
        product.subscribe(console.log.bind(console, 'product is now'));
        x(3);
        // 'sum is now', 8, 7
        // 'product is now', 15, 10
        console.log(sum());
        // 8
        y(8);
        // 'sum is now', 11, 8
        // 'product is now', 24, 15
    });
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

### prop.fn

An object containing attributes that will be applied to new observable properties.

## computed: Computed observables

### computed(fn:Function, dependencies:Array, [lazy:Boolean])

Creates a computed observable property. The property's value will be set to the return value of the given function `fn` and updated whenever any of the given `dependencies` changes.

If `lazy` is set to `true` (default: `false`), updating of the property's new value will be delayed until the first time the property is called. This also means subscribers will not be notified until the property is called directly.

The list of dependencies can be an array containing any kind of object that supports the `subscribe` and (optionally) `unsubscribe` methods. If a single object is passed instead of an array, the object will automatically be wrapped in an array.

### computed#()

Returns the computed property's current value. For lazy computed observables, this will trigger the function evaluation and notify any subscribers.

### computed#subscribe(callback:Function)

Adds the given callback function to this property's list of subscribers. See `prop#subscribe`.

### computed#unsubscribe(callback:Function)

Removes the given callback function from this property#s list of subscribers. See `prop#unsubscribe` .

### computed#peek()

Returns the comnputed property's current value. Unlike `computed#()` this will not trigger the function evaluation in lazy computed observables.

### computed#dismiss()

Unsubscribes the computed observable from all dependencies that support the `unsubscribe` method. This also means changes to the property's dependencies will no longer result in its value being recalculated.

### computed.fn

An object containing attributes that will be applied to new computed observable properties.

## util: Useful utilities used internally

### util.PubSub: Simple object that supports publishing and subscriptions

#### new util.PubSub()

Creates a new PubSub instance.

**NOTE:** This is a constructor. Use of the `new` keyword is therefore not optional.

#### util.PubSub#subscribe(callback:Function)

Adds the given callback function to this object's list of subscribers.

#### util.PubSub#unsubscribe(callback:Function)

Removes the given callback function from this object's list of subscribers.

#### util.PubSub#publish(messages…)

Publishes the given messages. Every callback function in this object's list of subscribers will be called sequentially with the given messages as its arguments.

### util.extend: Helper function to apply attributes from one object to another

#### util.extend(target, source…)

Applies all attributes of each of the given source objects to the given target object.

Returns the target object.

# Acknowledgements

This libary was heavily inspired by Steve Sanderson's knockout.js project.

# License

The MIT license. For more information see LICENSE.
