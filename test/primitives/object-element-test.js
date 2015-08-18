var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').init();

describe('ObjectElement', function() {
  var objectElement;

  function setObject() {
    objectElement = new minim.ObjectElement({
      foo: 'bar',
      z: 1
    });
  }

  before(function() {
    setObject();
  });

  beforeEach(function() {
    setObject();
  });

  describe('.content', function() {
    var correctElementNames;
    var storedElementNames;

    before(function() {
      correctElementNames = ['string', 'number'];
      storedElementNames = objectElement.content.map(function(el) {
        return el.value.element;
      });
    });

    it('has the correct element names', function() {
      expect(storedElementNames).to.deep.equal(correctElementNames);
    });
  });

  describe('#element', function() {
    it('is a string element', function() {
      expect(objectElement.element).to.equal('object');
    });
  });

  describe('#primitive', function() {
    it('returns object as the Refract primitive', function() {
      expect(objectElement.primitive()).to.equal('object');
    });
  });

  describe('#toValue', function() {
    it('returns the object', function() {
      expect(objectElement.toValue()).to.deep.equal({
        foo: 'bar',
        z: 1
      });
    });
  });

  describe('#toRefract', function() {
    var expected = {
      element: 'object',
      meta: {},
      attributes: {},
      content: [
        {
          element: 'member',
          meta: {},
          attributes: {},
          content: {
            key: {
              element: 'string',
              meta: {},
              attributes: {},
              content: 'foo'
            },
            value: {
              element: 'string',
              meta: {},
              attributes: {},
              content: 'bar'
            }
          }
        },
        {
          element: 'member',
          meta: {},
          attributes: {},
          content: {
            key: {
              element: 'string',
              meta: {},
              attributes: {},
              content: 'z'
            },
            value: {
              element: 'number',
              meta: {},
              attributes: {},
              content: 1
            }
          }
        }
      ]
    };

    it('returns an object element', function() {
      expect(objectElement.toRefract()).to.deep.equal(expected);
    });
  });

  describe('#toCompactRefract', function() {
    var expected = [
      'object', {}, {}, [
        ['member', {}, {}, {
          key: ['string', {}, {}, 'foo'],
          value: ['string', {}, {}, 'bar']
        }],
        ['member', {}, {}, {
          key: ['string', {}, {}, 'z'],
          value: ['number', {}, {}, 1]
        }]
      ]
    ];

    it('returns a object Compact element', function() {
      expect(objectElement.toCompactRefract()).to.deep.equal(expected);
    });
  });

  describe('#get', function() {
    context('when a property name is given', function() {
      it('returns the value of the name given', function() {
        expect(objectElement.get('foo').toValue()).to.equal('bar');
      });
    });

    context('when a property name is not given', function() {
      it('is undefined', function() {
        expect(objectElement.get()).to.be.undefined;
      });
    });
  });

  describe('#getValue', function() {
    context('when a property name is given', function() {
      it('returns the value of the name given', function() {
        expect(objectElement.getValue('foo')).to.equal('bar');
      });
    });

    context('when a property name is not given', function() {
      it('is undefined', function() {
        expect(objectElement.getValue()).to.be.undefined;
      });
    });
  });

  describe('#getMember', function() {
    context('when a property name is given', function() {
      it('returns the correct member object', function() {
        expect(objectElement.getMember('foo').value.toValue()).to.equal('bar');
      });
    });

    context('when a property name is not given', function() {
      it('is undefined', function() {
        expect(objectElement.getMember()).to.be.undefined;
      });
    });
  });

  describe('#getKey', function() {
    context('when a property name is given', function() {
      it('returns the correct key object', function() {
        expect(objectElement.getKey('foo').toValue()).to.equal('foo');
      });
    });

    context('when a property name given that does not exist', function() {
      it('returns undefined', function() {
        expect(objectElement.getKey('not-defined')).to.be.undefined;
      });
    });

    context('when a property name is not given', function() {
      it('returns undefined', function() {
        expect(objectElement.getKey()).to.be.undefined;
      });
    });
  });

  describe('#set', function() {
    it('sets the value of the name given', function() {
      expect(objectElement.get('foo').toValue()).to.equal('bar');
      objectElement.set('foo', 'hello world');
      expect(objectElement.get('foo').toValue()).to.equal('hello world');
    });

    it('sets a value that has not been defined yet', function() {
      objectElement.set('bar', 'hello world');
      expect(objectElement.get('bar').toValue()).to.equal('hello world');
    });

    it('accepts an object', function() {
      var obj = new minim.ObjectElement();
      obj.set({ foo: 'bar' });
      expect(obj.get('foo').toValue()).to.equal('bar');
    });
  });

  describe('#keys', function() {
    it('gets the keys of all properties', function() {
      expect(objectElement.keys()).to.deep.equal(['foo', 'z']);
    });
  });

  describe('#values', function() {
    it('gets the values of all properties', function() {
      expect(objectElement.values()).to.deep.equal(['bar', 1]);
    });
  });

  describe('#hasKey', function() {
    it('checks to see if a key exists', function() {
      expect(objectElement.hasKey('foo')).to.be.true;
      expect(objectElement.hasKey('does-not-exist')).to.be.false;
    });
  });

  describe('#items', function() {
    it('provides a list of name/value pairs to iterate', function() {
      var keys = [];
      var values = [];

      _.forEach(objectElement.items(), function(item) {
        var key = item[0];
        var value = item[1];

        keys.push(key);
        values.push(value);
      });

      expect(keys).to.have.members(['foo', 'z']);
      expect(values).to.have.length(2);
    });
  });

  function itHascollectionMethod(method) {
    describe('#' + method, function() {
      it('responds to #' + method, function() {
        expect(objectElement).to.respondTo(method);
      });
    });
  };

  itHascollectionMethod('map');
  itHascollectionMethod('filter');
  itHascollectionMethod('forEach');
  itHascollectionMethod('push');
  itHascollectionMethod('add');

  describe('#map', function() {
    it('provides the keys', function() {
      var keys = objectElement.map(function(value, key, member) {
        return key.toValue();
      });
      expect(keys).to.deep.equal(['foo', 'z']);
    });

    it('provides the values', function() {
      var values = objectElement.map(function(value, key, member) {
        return value.toValue();
      });
      expect(values).to.deep.equal(['bar', 1]);
    });

    it('provides the members', function() {
      var keys = objectElement.map(function(value, key, member) {
        return member.key.toValue();
      });
      expect(keys).to.deep.equal(['foo', 'z']);
    });
  });

  describe('#filter', function() {
    it('allows for filtering on keys', function() {
      var foo = objectElement.filter(function(value, key, member) {
        return key.equals('foo');
      });
      expect(foo.keys()).to.deep.equal(['foo']);
    });

    it('allows for filtering on values', function() {
      var foo = objectElement.filter(function(value, key, member) {
        return value.equals('bar');
      });
      expect(foo.keys()).to.deep.equal(['foo']);
    });

    it('allows for filtering on members', function() {
      var foo = objectElement.filter(function(value, key, member) {
        return member.value.equals('bar');
      });
      expect(foo.keys()).to.deep.equal(['foo']);
    });
  });

  describe('#reduce', function() {
    var numbers = new minim.ObjectElement({
      a: 1,
      b: 2,
      c: 3,
      d: 4
    });

    it('allows for reducing on keys', function() {
      var letters = numbers.reduce(function(result, item, key) {
        return result.push(key);
      }, []);
      expect(letters.toValue()).to.deep.equal(['a', 'b', 'c', 'd']);
    });

    it('sends member and object elements', function () {
      numbers.reduce(function(result, item, key, member, obj) {
        expect(obj.content).to.contain(member);
        expect(obj).to.equal(numbers);
      });
    });

    context('when no beginning value is given', function() {
      it('correctly reduces the object', function() {
        var total = numbers.reduce(function(result, item) {
          return result.toValue() + item.toValue();
        });
        expect(total.toValue()).to.equal(10);
      });
    });

    context('when a beginning value is given', function() {
      it('correctly reduces the object', function() {
        var total = numbers.reduce(function(result, item) {
          return result.toValue() + item.toValue();
        }, 20);
        expect(total.toValue()).to.equal(30);
      });
    });
  });

  describe('#forEach', function() {
    it('provides the keys', function() {
      var keys = [];
      objectElement.forEach(function(value, key, member) {
        return keys.push(key.toValue());
      });
      expect(keys).to.deep.equal(['foo', 'z']);
    });

    it('provides the values', function() {
      var values = [];
      objectElement.forEach(function(value, key, member) {
        return values.push(value.toValue());
      });
      expect(values).to.deep.equal(['bar', 1]);
    });

    it('provides the members', function() {
      var keys = [];
      objectElement.forEach(function(value, key, member) {
        return keys.push(member.key.toValue());
      });
      expect(keys).to.deep.equal(['foo', 'z']);
    });
  });

  describe('#find', function() {
    it('allows for searching based on the keys', function() {
      var search = objectElement.find(function(value, key) {
        return key.toValue() === 'z';
      });
      expect(search.toValue()).to.deep.equal([1]);
    });

    it('allows for searching based on the member', function() {
      var search = objectElement.find(function(value, key, member) {
        return member.key.toValue() === 'z';
      });
      expect(search.toValue()).to.deep.equal([1]);
    });
  });

  describe('#clone', function() {
    it('creates a deep clone of the element', function() {
      var clone = objectElement.clone();
      expect(clone).to.be.instanceOf(minim.ObjectElement);
      expect(clone).to.not.equal(objectElement);
      expect(clone.toRefract()).to.deep.equal(objectElement.toRefract());
    });
  });

  // describe('#[Symbol.iterator]', function() {
  //   it('can be used in a for ... of loop', function() {
  //     var items = [];
  //     for (let item of objectElement) {
  //       items.push(item);
  //     }
  //
  //     expect(items).to.have.length(2);
  //   });
  // });
});
