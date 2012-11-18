/*global describe, it, expect, obs */
describe('util.extend', function() {
    var extend = obs.util.extend;
    it('returns the first argument', function() {
        var originalObject = {},
            extendingObject = {},
            extendedObject = extend(originalObject, extendingObject);
        expect(extendedObject).to.equal(originalObject);
        expect(extendedObject).not.to.equal(extendingObject);
    });
    it('adds new properties to the given object', function() {
        var extendingObject = {c: 3, d: 4},
            extendedObject = extend({a: 1, b: 2}, extendingObject);
        expect(Object.keys(extendedObject).sort()).to.eql(['a', 'b', 'c', 'd']);
    });
    it('overwrites the original object\'s properties', function() {
        var object = extend({a: 1, b: 2}, {b: 3});
        expect(object.a).to.equal(1);
        expect(object.b).to.equal(3);
    });
    it('does not modify the extending object', function() {
        var extendingObject = {b: 2};
        extend({a: 1}, extendingObject);
        expect(Object.keys(extendingObject)).to.eql(['b']);
        expect(extendingObject.b).to.equal(2);
    });
    it('works with multiple extending objects', function() {
        var object = extend({a: 1}, {b: 2}, {c: 3});
        expect(object).to.eql({a: 1, b: 2, c: 3});
    });
    describe('when used with a single argument', function() {
        it('does not modify the object', function() {
            var object = extend({a: 1, b: 2, c: 3});
            expect(object).to.eql({a: 1, b: 2, c: 3});
        });
    });
});
