var _ = require('lodash');
var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');

describe('Minim Primitives', function() {
  describe('ElementType', function() {
    context('when initializing', function() {
      var el;

      before(function() {
        el = new minim.ElementType({}, {
          id: 'foobar',
          class: ['a', 'b'],
          title: 'Title',
          description: 'Description'
        });
      });

      it('should initialize the correct meta data', function() {
        expect(el.meta.id.toValue()).to.equal('foobar');
        expect(el.meta.class.toValue()).to.deep.equal(['a', 'b']);
        expect(el.meta.title.toValue()).to.equal('Title');
        expect(el.meta.description.toValue()).to.equal('Description');
      });
    });

    describe('#element', function() {
      context('when getting an element that has not been set', function() {
        var el;

        before(function() {
          el = new minim.ElementType();
        });

        it('returns base element', function() {
          expect(el.element).to.equal('element');
        });
      });

      context('when setting the element', function() {
        var el;

        before(function() {
          el = new minim.ElementType();
          el.element = 'foobar';
        });

        it('sets the element correctly', function() {
          expect(el.element).to.equal('foobar');
        });
      })
    });

    describe('#equals', function() {
      var el;

      before(function() {
        el = new minim.ElementType({
          foo: 'bar'
        }, {
          id: 'foobar'
        });
      });

      it('returns true when they are equal', function() {
        expect(el.meta.id.equals('foobar')).to.be.true;
      });

      it('returns false when they are not equal', function() {
        expect(el.meta.id.equals('not-equal')).to.be.false;
      });

      it('does a deep equality check', function() {
        expect(el.equals({ foo: 'bar'})).to.be.true;
        expect(el.equals({ foo: 'baz'})).to.be.false;
      });
    });
  });

  describe('convertToType', function() {
    function typeCheck(name, val) {
      var returnedType;

      context('when given ' + name, function() {
        before(function() {
          returnedType = minim.convertToType(val);
        });

        it('returns ' + name, function() {
          expect(returnedType.element).to.equal(name);
        });
      });
    }

    typeCheck('null', null);
    typeCheck('string', 'foobar');
    typeCheck('number', 1);
    typeCheck('boolean', true);
    typeCheck('array', [1, 2, 3]);
    typeCheck('object', {
      foo: 'bar'
    });
  });

  describe('convertFromType', function() {
    function typeCheck(name, el) {
      context('when given ' + name, function() {
        var returnedType;

        before(function() {
          returnedType = minim.convertFromRefract(el);
        });

        it('returns ' + name + ' element', function() {
          expect(returnedType.element).to.equal(name);
        });

        it('has the correct value', function() {
          expect(returnedType.toValue()).to.equal(el.content);
        });
      });

      context('when given compact ' + name, function() {
        var returnedType;

        before(function() {
          // NOTE: If this is ever giving you issues, remember that it
          //       does NOT handle nested long-form elements.
          returnedType = minim.convertFromCompactRefract([
            el.element, el.metadata, el.attributes, el.content
          ]);
        });

        it('returns ' + name + ' element', function() {
          expect(returnedType.element).to.equal(name);
        });

        it('has the correct value', function() {
          expect(returnedType.toValue()).to.equal(el.content);
        });
      });
    }

    typeCheck('null', {
      element: 'null',
      content: null
    });

    typeCheck('string', {
      element: 'string',
      content: 'foo'
    });

    typeCheck('number', {
      element: 'number',
      content: 4
    });

    typeCheck('boolean', {
      element: 'boolean',
      content: true
    });

    context('when given array', function() {
      var el = {
        element: 'array',
        content: [
          {
            element: 'number',
            content: 1
          }, {
            element: 'number',
            content: 2
          }
        ]
      };
      var returnedType;

      before(function() {
        returnedType = minim.convertFromRefract(el);
      });

      it('returns array element', function() {
        expect(returnedType.element).to.equal('array');
      });

      it('has the correct values', function() {
        expect(returnedType.toValue()).to.deep.equal([1, 2]);
      });
    });

    context('when given object', function() {
      var el = {
        element: 'object',
        meta: {},
        attributes: {},
        content: [
          {
            element: 'member',
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
                content: 2
              }
            }
          }
        ]
      };
      var returnedType;

      before(function() {
        returnedType = minim.convertFromRefract(el);
      });

      it('returns object element', function() {
        expect(returnedType.element).to.equal('object');
      });

      it('has the correct values', function() {
        expect(returnedType.toValue()).to.deep.equal({
          foo: 'bar',
          z: 2
        });
      });
    });
  });

  describe('NullType', function() {
    var nullType;

    before(function() {
      nullType = new minim.NullType();
    });

    describe('#element', function() {
      it('is null', function() {
        expect(nullType.element).to.equal('null');
      });
    });

    describe('#primitive', function() {
      it('returns null as the Refract primitive', function() {
        expect(nullType.primitive()).to.equal('null');
      });
    });

    describe('#toValue', function() {
      it('returns null', function() {
        expect(nullType.toValue()).to.equal(null);
      });
    });

    describe('#toRefract', function() {
      var expected = {
        element: 'null',
        meta: {},
        attributes: {},
        content: null
      };

      it('returns a null DOM object', function() {
        expect(nullType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['null', {}, {}, null];
      it('returns a null Compact DOM object', function() {
        expect(nullType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the null value', function() {
        expect(nullType.toValue()).to.equal(null);
      });
    });

    describe('#set', function() {
      it('cannot set the value', function() {
        expect(nullType.set('foobar')).to.be.an.instanceof(Error);
      });
    });
  });

  describe('StringType', function() {
    var stringType;

    before(function() {
      stringType = new minim.StringType('foobar');
    });

    describe('#element', function() {
      it('is a string', function() {
        expect(stringType.element).to.equal('string');
      });
    });

    describe('#primitive', function() {
      it('returns string as the Refract primitive', function() {
        expect(stringType.primitive()).to.equal('string');
      });
    });

    describe('#toValue', function() {
      it('returns the string', function() {
        expect(stringType.toValue()).to.equal('foobar');
      });
    });

    describe('#toRefract', function() {
      var expected = {
        element: 'string',
        meta: {},
        attributes: {},
        content: 'foobar'
      };

      it('returns a string DOM object', function() {
        expect(stringType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['string', {}, {}, 'foobar'];

      it('returns a string Compact DOM object', function() {
        expect(stringType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the string value', function() {
        expect(stringType.toValue()).to.equal('foobar');
      });
    });

    describe('#set', function() {
      it('sets the value of the string', function() {
        stringType.set('hello world');
        expect(stringType.toValue()).to.equal('hello world');
      });
    });
  });

  describe('NumberType', function() {
    var numberType;

    before(function() {
      numberType = new minim.NumberType(4);
    });

    describe('#element', function() {
      it('is a number', function() {
        expect(numberType.element).to.equal('number');
      });
    });

    describe('#primitive', function() {
      it('returns number as the Refract primitive', function() {
        expect(numberType.primitive()).to.equal('number');
      });
    });

    describe('#toValue', function() {
      it('returns the number', function() {
        expect(numberType.toValue()).to.equal(4);
      });
    });

    describe('#toRefract', function() {
      var expected = {
        element: 'number',
        meta: {},
        attributes: {},
        content: 4
      };

      it('returns a number DOM object', function() {
        expect(numberType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['number', {}, {}, 4];

      it('returns a number Compact DOM object', function() {
        expect(numberType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the number value', function() {
        expect(numberType.toValue()).to.equal(4);
      });
    });

    describe('#set', function() {
      it('sets the value of the number', function() {
        numberType.set(10);
        expect(numberType.toValue()).to.equal(10);
      });
    });
  });

  describe('BoolType', function() {
    var boolType;

    before(function() {
      boolType = new minim.BooleanType(true);
    });

    describe('#element', function() {
      it('is a boolean', function() {
        expect(boolType.element).to.equal('boolean');
      });
    });

    describe('#primitive', function() {
      it('returns boolean as the Refract primitive', function() {
        expect(boolType.primitive()).to.equal('boolean');
      });
    });

    describe('#toValue', function() {
      it('returns the boolean', function() {
        expect(boolType.toValue()).to.equal(true);
      });
    });

    describe('#toRefract', function() {
      var expected = {
        element: 'boolean',
        meta: {},
        attributes: {},
        content: true
      };

      it('returns a boolean DOM object', function() {
        expect(boolType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['boolean', {}, {}, true];

      it('returns a boolean Compact DOM object', function() {
        expect(boolType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the boolean value', function() {
        expect(boolType.toValue()).to.equal(true);
      });
    });

    describe('#set', function() {
      it('sets the value of the boolean', function() {
        boolType.set(false);
        expect(boolType.toValue()).to.equal(false);
      });
    });
  });

  describe('Collection', function() {
    describe('searching', function() {
      var refract = {
        element: 'array',
        content: [
          {
            element: 'string',
            content: 'foobar'
          }, {
            element: 'string',
            content: 'hello world'
          }, {
            element: 'array',
            content: [
              {
                element: 'string',
                content: 'baz'
              }, {
                element: 'boolean',
                content: true
              }, {
                element: 'array',
                content: [
                  {
                    element: 'string',
                    meta: {
                      id: 'nested-id'
                    },
                    content: 'bar'
                  }, {
                    element: 'number',
                    content: 4
                  }
                ]
              }
            ]
          }
        ]
      };

      var doc;
      var strings;
      var recursiveStrings;

      before(function() {
        doc = minim.convertFromRefract(refract);
        strings = doc.children(function(el) {
          return el.element === 'string';
        });
        recursiveStrings = doc.find(function(el) {
          return el.element === 'string';
        });
      });

      describe('#children', function() {
        it('returns the correct number of items', function() {
          expect(strings.length).to.equal(2);
        });

        it('returns the correct values', function() {
          expect(strings.toValue()).to.deep.equal(['foobar', 'hello world']);
        });
      });

      describe('#find', function() {
        it('returns the correct number of items', function() {
          expect(recursiveStrings.length).to.equal(4);
        });

        it('returns the correct values', function() {
          expect(recursiveStrings.toValue()).to.deep.equal(['foobar', 'hello world', 'baz', 'bar']);
        });
      });

      describe('#first', function() {
        it('returns the first item', function() {
          expect(doc.first()).to.deep.equal(doc.content[0]);
        });
      });

      describe('#second', function() {
        it('returns the first item', function() {
          expect(doc.second()).to.deep.equal(doc.content[1]);
        });
      });

      describe('#last', function() {
        it('returns the first item', function() {
          expect(doc.last()).to.deep.equal(doc.content[2]);
        });
      });

      describe('#getById', function() {
        it('returns the item for the ID given', function() {
          expect(doc.getById('nested-id').toValue()).to.equal('bar');
        });
      });

      describe('#contains', function() {
        it('uses deep equality', function() {
          expect(doc.get(2).contains(['not', 'there'])).to.be.false;
          expect(doc.get(2).contains(['bar', 4])).to.be.true;
        });

        context('when given a value that is in the array', function() {
          it('returns true', function() {
            expect(doc.contains('foobar')).to.be.true;
          });
        });

        context('when given a value that is not in the array', function() {
          it('returns false', function() {
            expect(doc.contains('not-there')).to.be.false;
          });
        });
      });
    });
  });

  describe('ArrayType', function() {
    var arrayType;

    function setArray() {
      arrayType = new minim.ArrayType(['a', true, null, 1]);
    }

    before(function() {
      setArray();
    });

    beforeEach(function() {
      setArray();
    });

    describe('.content', function() {
      var correctTypes;
      var storedTypes;

      before(function() {
        correctTypes = ['string', 'boolean', 'null', 'number'];
        storedTypes = arrayType.content.map(function(el) {
          return el.element;
        });
      });

      it('stores the correct types', function() {
        expect(storedTypes).to.deep.equal(correctTypes);
      });
    });

    describe('#element', function() {
      it('is an array', function() {
        expect(arrayType.element).to.equal('array');
      });
    });

    describe('#primitive', function() {
      it('returns array as the Refract primitive', function() {
        expect(arrayType.primitive()).to.equal('array');
      });
    });

    describe('#toValue', function() {
      it('returns the array', function() {
        expect(arrayType.toValue()).to.deep.equal(['a', true, null, 1]);
      });
    });

    describe('#toRefract', function() {
      var expected = {
        element: 'array',
        meta: {},
        attributes: {},
        content: [
          {
            element: 'string',
            meta: {},
            attributes: {},
            content: 'a'
          }, {
            element: 'boolean',
            meta: {},
            attributes: {},
            content: true
          }, {
            element: 'null',
            meta: {},
            attributes: {},
            content: null
          }, {
            element: 'number',
            meta: {},
            attributes: {},
            content: 1
          }
        ]
      };

      it('returns an array DOM object', function() {
        expect(arrayType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['array', {}, {}, [['string', {}, {}, 'a'], ['boolean', {}, {}, true], ['null', {}, {}, null], ['number', {}, {}, 1]]];

      it('returns an array Compact DOM object', function() {
        expect(arrayType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      context('when an index is given', function() {
        it('returns the item from the array', function() {
          expect(arrayType.get(0).toValue()).to.equal('a');
        });
      });

      context('when no index is given', function() {
        it('is undefined', function() {
          expect(arrayType.get()).to.be.undefined;
        });
      });
    });

    describe('#set', function() {
      it('sets the value of the array', function() {
        arrayType.set(0, 'hello world');
        expect(arrayType.get(0).toValue()).to.equal('hello world');
      });
    });

    describe('#map', function() {
      it('allows for mapping the content of the array', function() {
        var newArray = arrayType.map(function(item) {
          return item.toValue();
        });
        expect(newArray).to.deep.equal(['a', true, null, 1]);
      });
    });

    describe('#filter', function() {
      it('allows for filtering the content', function() {
        var newArray = arrayType.filter(function(item) {
          var ref;
          return (ref = item.toValue()) === 'a' || ref === 1;
        });
        expect(newArray.toValue()).to.deep.equal(['a', 1]);
      });
    });

    describe('#forEach', function() {
      it('iterates over each item', function() {
        var results;
        results = [];
        arrayType.forEach(function(item) {
          return results.push(item);
        });
        expect(results.length).to.equal(4);
      });
    });

    describe('#length', function() {
      it('returns the length of the content', function() {
        expect(arrayType.length).to.equal(4);
      });
    });

    function itAddsToArray(instance) {
      expect(instance.length).to.equal(5);
      expect(instance.get(4).toValue()).to.equal('foobar');
    };

    describe('#push', function() {
      it('adds a new item to the array', function() {
        arrayType.push('foobar');
        itAddsToArray(arrayType);
      });
    });

    describe('#add', function() {
      it('adds a new item to the array', function() {
        arrayType.add('foobar');
        itAddsToArray(arrayType);
      });
    });

    // describe('#[Symbol.iterator]', function() {
    //   it('can be used in a for ... of loop', function() {
    //     var items = [];
    //     for (let item of arrayType) {
    //       items.push(item);
    //     }
    //
    //     expect(items).to.have.length(4);
    //   });
    // });
  });

  describe('ObjectType', function() {
    var objectType;

    function setObject() {
      objectType = new minim.ObjectType({
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
      var correctTypes, storedTypes;

      before(function() {
        correctTypes = ['string', 'number'];
        storedTypes = objectType.content.map(function(el) {
          return el.value.element;
        });
      });

      it('has the correct types', function() {
        expect(storedTypes).to.deep.equal(correctTypes);
      });
    });

    describe('#element', function() {
      it('is a string type', function() {
        expect(objectType.element).to.equal('object');
      });
    });

    describe('#primitive', function() {
      it('returns object as the Refract primitive', function() {
        expect(objectType.primitive()).to.equal('object');
      });
    });

    describe('#toValue', function() {
      it('returns the object', function() {
        expect(objectType.toValue()).to.deep.equal({
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

      it('returns an object DOM object', function() {
        expect(objectType.toRefract()).to.deep.equal(expected);
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

      it('returns a object Compact DOM object', function() {
        expect(objectType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      context('when a property name is given', function() {
        it('returns the value of the name given', function() {
          expect(objectType.get('foo').toValue()).to.equal('bar');
        });
      });

      context('when a property name is not given', function() {
        it('is undefined', function() {
          expect(objectType.get()).to.be.undefined;
        });
      });
    });

    describe('#getMember', function() {
      context('when a property name is given', function() {
        it('returns the correct member object', function() {
          expect(objectType.getMember('foo').value.toValue()).to.equal('bar');
        });
      });

      context('when a property name is not given', function() {
        it('is undefined', function() {
          expect(objectType.getMember()).to.be.undefined;
        });
      });
    });

    describe('#getKey', function() {
      context('when a property name is given', function() {
        it('returns the correct key object', function() {
          expect(objectType.getKey('foo').toValue()).to.equal('foo');
        });
      });

      context('when a property name given that does not exist', function() {
        it('returns undefined', function() {
          expect(objectType.getKey('not-defined')).to.be.undefined;
        });
      });

      context('when a property name is not given', function() {
        it('returns undefined', function() {
          expect(objectType.getKey()).to.be.undefined;
        });
      });
    });

    describe('#set', function() {
      it('sets the value of the name given', function() {
        expect(objectType.get('foo').toValue()).to.equal('bar');
        objectType.set('foo', 'hello world');
        expect(objectType.get('foo').toValue()).to.equal('hello world');
      });

      it('sets a value that has not been defined yet', function() {
        objectType.set('bar', 'hello world');
        expect(objectType.get('bar').toValue()).to.equal('hello world');
      });
    });

    describe('#keys', function() {
      it('gets the keys of all properties', function() {
        expect(objectType.keys()).to.deep.equal(['foo', 'z']);
      });
    });

    describe('#values', function() {
      it('gets the values of all properties', function() {
        expect(objectType.values()).to.deep.equal(['bar', 1]);
      });
    });

    describe('#hasKey', function() {
      it('checks to see if a key exists', function() {
        expect(objectType.hasKey('foo')).to.be.true;
        expect(objectType.hasKey('does-not-exist')).to.be.false;
      });
    });

    describe('#items', function() {
      it('provides a list of name/value pairs to iterate', function() {
        var keys = [];
        var values = [];

        _.forEach(objectType.items(), function(item) {
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
          expect(objectType).to.respondTo(method);
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
        var keys = objectType.map(function(value, key, member) {
          return key.toValue();
        });
        expect(keys).to.deep.equal(['foo', 'z']);
      });

      it('provides the values', function() {
        var values = objectType.map(function(value, key, member) {
          return value.toValue();
        });
        expect(values).to.deep.equal(['bar', 1]);
      });

      it('provides the members', function() {
        var keys = objectType.map(function(value, key, member) {
          return member.key.toValue();
        });
        expect(keys).to.deep.equal(['foo', 'z']);
      });
    });

    describe('#filter', function() {
      it('allows for filtering on keys', function() {
        var foo = objectType.filter(function(value, key, member) {
          return key.equals('foo');
        });
        expect(foo.keys()).to.deep.equal(['foo']);
      });

      it('allows for filtering on values', function() {
        var foo = objectType.filter(function(value, key, member) {
          return value.equals('bar');
        });
        expect(foo.keys()).to.deep.equal(['foo']);
      });

      it('allows for filtering on members', function() {
        var foo = objectType.filter(function(value, key, member) {
          return member.value.equals('bar');
        });
        expect(foo.keys()).to.deep.equal(['foo']);
      });
    });

    describe('#forEach', function() {
      it('provides the keys', function() {
        var keys = [];
        objectType.forEach(function(value, key, member) {
          return keys.push(key.toValue());
        });
        expect(keys).to.deep.equal(['foo', 'z']);
      });

      it('provides the values', function() {
        var values = [];
        objectType.forEach(function(value, key, member) {
          return values.push(value.toValue());
        });
        expect(values).to.deep.equal(['bar', 1]);
      });

      it('provides the members', function() {
        var keys = [];
        objectType.forEach(function(value, key, member) {
          return keys.push(member.key.toValue());
        });
        expect(keys).to.deep.equal(['foo', 'z']);
      });
    });

    // describe('#[Symbol.iterator]', function() {
    //   it('can be used in a for ... of loop', function() {
    //     var items = [];
    //     for (let item of objectType) {
    //       items.push(item);
    //     }
    //
    //     expect(items).to.have.length(2);
    //   });
    // });
  });

  describe('MemberType', function() {
    var member = new minim.MemberType('foo', 'bar', {}, { foo: 'bar' });

    it('correctly sets the key and value', function() {
      expect(member.key.toValue()).to.equal('foo');
      expect(member.value.toValue()).to.equal('bar');
    });

    it('correctly sets the attributes', function() {
      expect(member.attributes.foo).to.equal('bar');
    });

    describe('#toRefract', function() {
      it('returns the correct Refract value', function() {
        expect(member.toRefract()).to.deep.equal({
          element: 'member',
          meta: {},
          attributes: { foo: 'bar' },
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
        });
      });
    });

    describe('#toCompactRefract', function() {
      it('returns the correct compact Refract value', function() {
        expect(member.toCompactRefract()).to.deep.equal([
          'member', {}, { foo: 'bar' }, {
            key: ['string', {}, {}, 'foo'],
            value: ['string', {}, {}, 'bar'],
          }
        ]);
      });
    });
  })
});
