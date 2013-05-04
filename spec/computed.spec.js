/*global describe, it, beforeEach, afterEach */
var expect = require('expect.js'),
    obs = require('../');

describe('computed', function() {
    describe('when created as eager (default)', function() {
        var x, y, computed;
        beforeEach(function() {
            x = obs.prop(2);
            y = obs.prop(5);
        });
        it('initially contains the function\'s result', function() {
            var initialValue;
            computed = obs.computed({
                compute: function() {
                    return x() + y();
                },
                watch: [x, y]
            });
            initialValue = computed.peek();
            expect(x() + y()).to.equal(initialValue);
            computed.dismiss();
        });
        describe('when called at any time', function() {
            it('does not notify its subscribers', function() {
                var timesCalled = 0,
                    subscriber = function() {timesCalled += 1;};
                computed = obs.computed({
                    compute: function() {
                        return x() + y();
                    },
                    watch: [x, y]
                });
                computed.subscribe(subscriber);
                computed();
                expect(timesCalled).to.equal(0);
                computed();
                expect(timesCalled).to.equal(0);
                computed.unsubscribe(subscriber);
                computed.dismiss();
            });
        });
        describe('when dependencies change', function() {
            it('does notify its subscribers when dependencies change', function() {
                var messages = [],
                    subscriber = function(msg) {messages.push(msg);},
                    oldY = y(),
                    newX = 20,
                    newY = 50;
                computed = obs.computed({
                    compute: function() {
                        return x() + y();
                    },
                    watch: [x, y]
                });
                computed.subscribe(subscriber);
                x(newX);
                y(newY);
                expect(messages).to.eql([newX + oldY, newX + newY]);
                computed.unsubscribe(subscriber);
                computed.dismiss();
            });
            it('notifies its subscribers with its old and new value', function() {
                var subscriber = function(newVal, oldVal) {
                        publishedNewVal = newVal;
                        publishedOldVal = oldVal;
                    },
                    newY = y() * 2,
                    expectedNewVal = x() + newY,
                    publishedNewVal,
                    publishedOldVal,
                    oldVal;
                computed = obs.computed({
                    compute: function() {
                        return x() + y();
                    },
                    watch: [x, y]
                });
                oldVal = computed();
                computed.subscribe(subscriber);
                y(newY);
                expect(publishedNewVal).to.equal(expectedNewVal);
                expect(publishedOldVal).to.equal(oldVal);
                computed.unsubscribe(subscriber);
                computed.dismiss();
            });
        });
    });
    describe('when created as lazy', function() {
        var x, y, computed;
        beforeEach(function() {
            x = obs.prop(2);
            y = obs.prop(5);
        });
        afterEach(function() {
            computed.dismiss();
            computed.subscribers = [];
        });
        it('initially contains nothing', function() {
            var initialValue;
            computed = obs.computed.lazy({
                compute: function() {
                    return x() + y();
                },
                watch: [x, y]
            });
            initialValue = computed.peek();
            expect(initialValue).to.be(undefined);
            computed.dismiss();
        });
        describe('when called for the very first time', function() {
            it('does notify its subscribers', function() {
                var timesCalled = 0,
                    subscriber = function() {timesCalled += 1;};
                computed = obs.computed.lazy({
                    compute: function() {
                        return x() + y();
                    },
                    watch: [x, y]
                });
                computed.subscribe(subscriber);
                computed();
                expect(timesCalled).to.equal(1);
                computed();
                expect(timesCalled).to.equal(1);
                computed.unsubscribe(subscriber);
                computed.dismiss();
            });
        });
        describe('when dependencies change', function() {
            it('does not notify its subscribers', function() {
                var messages = [],
                    subscriber = function(msg) {messages.push(msg);},
                    newX = 20,
                    newY = 50;
                computed = obs.computed.lazy({
                    compute: function() {
                        return x() + y();
                    },
                    watch: [x, y]
                });
                computed.subscribe(subscriber);
                x(newX);
                expect(messages).to.be.empty();
                y(newY);
                expect(messages).to.be.empty();
                computed.unsubscribe(subscriber);
                computed.dismiss();
            });
        });
        describe('when called for the very first time after a dependency changed', function() {
            it('does notify its subscribers', function() {
                var timesCalled = 0,
                    subscriber = function() {timesCalled += 1;};
                computed = obs.computed.lazy(function() {
                    return x() + y();
                }, [x, y]);
                computed.subscribe(subscriber);
                x(20);
                expect(timesCalled).to.equal(0);
                computed();
                expect(timesCalled).to.equal(1);
                computed();
                expect(timesCalled).to.equal(1);
                computed.unsubscribe(subscriber);
                computed.dismiss();
            });
        });
    });
    describe('when created without dependencies', function() {
        var x = obs.prop(2),
            y = obs.prop(5),
            computed = obs.computed(function() {
                return x() + y();
            });
        it('does not change when used observables change', function() {
            var oldValue = computed(),
                newValue;
            x(20);
            y(50);
            newValue = computed();
            expect(oldValue).to.equal(newValue);
        });
    });
    describe('when created with unrelated dependencies', function() {
        var x = obs.prop(2),
            y = obs.prop(5),
            z = obs.prop(7),
            computed = obs.computed({
                compute: function() {
                    return x() + y();
                },
                watch: [x, y, z]
            });
        it('notifies its subscribers when they change, too', function() {
            var timesCalled = 0,
                subscriber = function() {timesCalled += 1;};
            computed.subscribe(subscriber);
            z(70);
            expect(timesCalled).to.equal(1);
            computed.unsubscribe(subscriber);
            computed.dismiss();
        });
    });
    describe('when dismissed', function() {
        var x = obs.prop(2),
            y = obs.prop(5),
            computed = obs.computed({
                compute: function() {
                    return x() + y();
                },
                watch: [x, y]
            });
        computed.dismiss();
        it('no longer changes when its dependencies are updated.', function() {
            var oldValue = computed(),
                newValue;
            x(200);
            y(500);
            newValue = computed();
            expect(newValue).to.equal(oldValue);
        });
    });
    it('calls its read function with its passed context', function() {
        var ctx = {},
            actualCtx = null,
            computed = obs.computed({
                compute: function() {
                    actualCtx = this;
                },
                context: ctx
            });
        computed();
        expect(actualCtx).to.equal(ctx);
    });
    it('calls its write function with its passed context', function() {
        var ctx = {},
            actualCtx = null,
            computed = obs.computed({
                compute: function() {
                    // pass
                },
                write: function() {
                    actualCtx = this;
                },
                context: ctx
            });
        computed(null);
        expect(actualCtx).to.equal(ctx);
    });
});
