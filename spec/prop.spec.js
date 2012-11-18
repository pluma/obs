/*global describe, it, expect, obs */
describe('prop', function() {
    var originalFn = obs.util.extend({}, obs.prop.fn);
    beforeEach(function() {
        obs.prop.fn = obs.util.extend({}, originalFn);
    });
    it('inherits all properties of prop.fn', function() {
        var prop;
        obs.prop.fn.inheritedProperty = 'example';
        prop = obs.prop();
        expect(prop.inheritedProperty).to.equal(obs.prop.fn.inheritedProperty);
    });
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
        it('publishes its new value', function() {
            var newValue = 'new value',
                subscriber = function(val) {publishedValue = val;},
                publishedValue;
            prop.subscribe(subscriber);
            prop(newValue);
            expect(newValue).to.equal(publishedValue);
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
