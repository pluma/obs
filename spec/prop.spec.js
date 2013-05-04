/*global describe, it, beforeEach */
var expect = require('expect.js'),
    obs = require('../');

describe('prop', function() {
    describe('when called without a new value', function() {
        var prop = obs.prop();
        it('returns its current value', function() {
            var value = 'value',
                returnedValue;
            prop(value);
            returnedValue = prop();
            expect(value).to.equal(returnedValue);
        });
    });
    describe('when called with a new value', function() {
        var prop;
        beforeEach(function() {
            prop = obs.prop();
        });
        it('publishes its new and old value', function() {
            var oldValue = 'old value',
                newValue = 'new value',
                subscriber = function(newVal, oldVal) {
                    publishedNewValue = newVal;
                    publishedOldValue = oldVal;
                },
                publishedNewValue,
                publishedOldValue;
            prop(oldValue);
            prop.subscribe(subscriber);
            prop(newValue);
            expect(newValue).to.equal(publishedNewValue);
            expect(oldValue).to.equal(publishedOldValue);
            prop.unsubscribe(subscriber);
        });
        describe('the next time it is called without a value', function() {
            it('returns the new value', function() {
                var value = 'example',
                    returnedValue;
                prop(value);
                returnedValue = prop();
                expect(value).to.equal(returnedValue);
            });
        });
    });
    describe('when called after being created with an initial value', function() {
        var initialValue = 'hello world',
            prop = obs.prop(initialValue);
        it('returns its initial value when called', function() {
            expect(initialValue).to.equal(prop());
        });
    });
});
