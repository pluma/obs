/*global describe, it, expect, obs */
describe('util.PubSub', function() {
    var PubSub = obs.util.PubSub;
    it('remembers subscribers', function() {
        var subscriber = function() {},
            pubsub = new PubSub();
        pubsub.subscribe(subscriber);
        expect(pubsub._subscribers).to.only.contain(subscriber);
    });
    it('notifies subscribers when a message is published', function() {
        var pubsub = new PubSub(),
            messages = [],
            subscriber = function(msg) {messages.push(msg);},
            message = 'hello world';
        pubsub.subscribe(subscriber);
        pubsub.publish(message);
        expect(messages).to.only.contain(message);
    });
    it('passes all published arguments to subscribers', function() {
        var pubsub = new PubSub(),
            messages = [],
            subscriber = function() {messages.push(Array.prototype.slice.call(arguments, 0));},
            message = ['hello', 'world'];
        pubsub.subscribe(subscriber);
        pubsub.publish.apply(pubsub, message);
        expect(messages.length).to.equal(1);
        expect(messages[0]).to.eql(message);
    });
    it('notifies each subscriber in sequence', function() {
        var pubsub = new PubSub(),
            results = [];
        pubsub.subscribe(function() {results.push('one');});
        pubsub.subscribe(function() {results.push('two');});
        pubsub.subscribe(function() {results.push('three');});
        pubsub.publish('message');
        expect(results).to.eql(['one', 'two', 'three']);
    });
    it('publishes each message in sequence', function() {
        var pubsub = new PubSub(),
            messages = [],
            subscriber = function(msg) {messages.push(msg);};
        pubsub.subscribe(subscriber);
        pubsub.publish('one');
        pubsub.publish('two');
        pubsub.publish('three');
        expect(messages).to.eql(['one', 'two', 'three']);
    });
    describe('when notified without subscribers', function() {
        it('does not throw an error', function() {
            var pubsub = new PubSub();
            pubsub.publish('hello');
        });
    });
    describe('when a subscribed function is unsubscribed', function() {
        var pubsub, result,
            subscriber1 = function() {subscriber1.timesCalled += 1;},
            subscriber2 = function() {subscriber2.timesCalled += 1;};
        beforeEach(function() {
            pubsub = new PubSub();
            subscriber1.timesCalled = 0;
            subscriber2.timesCalled = 0;
            pubsub.subscribe(subscriber1);
            pubsub.subscribe(subscriber2);
            result = pubsub.unsubscribe(subscriber1);
        });
        it('returns true', function() {
            expect(result).to.equal(true);
        });
        it('does not unsubscribe other functions', function() {
            expect(pubsub._subscribers).to.only.contain(subscriber2);
        });
        it('does not notify unsubscribed functions', function() {
            pubsub.publish('message');
            expect(subscriber1.timesCalled).to.equal(0);
        });
        it('does notify other subscribed functions', function() {
            pubsub.publish('message');
            expect(subscriber2.timesCalled).to.equal(1);
        });
    });
    describe('when a non-subscribed function is unsubscribed', function() {
        it('returns false', function() {
            var pubsub = new PubSub(),
                subscriber = function() {},
                nonSubscriber = function() {},
                result;
            pubsub.subscribe(subscriber);
            result = pubsub.unsubscribe(nonSubscriber);
            expect(result).to.equal(false);
            expect(pubsub._subscribers).to.only.contain(subscriber);
        });
    });
});
