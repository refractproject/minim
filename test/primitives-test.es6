import {expect} from './spec-helper';
import minim from '../lib/minim';

describe('Minim Primitives', function() {
  describe('convertToType', function() {
    function typeCheck(name, val) {
      let returnedType;

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
        let returnedType;

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
        let returnedType;

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
      const el = {
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
      let returnedType;

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
      const el = {
        element: 'object',
        content: [
          {
            element: 'string',
            meta: {
              name: 'foo'
            },
            content: 'bar'
          }, {
            element: 'number',
            meta: {
              name: 'z'
            },
            content: 2
          }
        ]
      };
      let returnedType;

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
    let nullType;

    before(function() {
      nullType = new minim.NullType();
    });

    describe('#elementType', function() {
      it('is null', function() {
        expect(nullType.element).to.equal('null');
      });
    });

    describe('#toValue', function() {
      it('returns null', function() {
        expect(nullType.toValue()).to.equal(null);
      });
    });

    describe('#toRefract', function() {
      const expected = {
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
      const expected = ['null', {}, {}, null];
      it('returns a null Compact DOM object', function() {
        expect(nullType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the null value', function() {
        expect(nullType.get()).to.equal(null);
      });
    });

    describe('#set', function() {
      it('cannot set the value', function() {
        expect(nullType.set('foobar')).to.be.an.instanceof(Error);
      });
    });
  });

  describe('StringType', function() {
    let stringType;

    before(function() {
      stringType = new minim.StringType('foobar');
    });

    describe('#elementType', function() {
      it('is a boolean', function() {
        expect(stringType.element).to.equal('string');
      });
    });

    describe('#toValue', function() {
      it('returns the string', function() {
        expect(stringType.toValue()).to.equal('foobar');
      });
    });

    describe('#toRefract', function() {
      const expected = {
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
      const expected = ['string', {}, {}, 'foobar'];

      it('returns a string Compact DOM object', function() {
        expect(stringType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the string value', function() {
        expect(stringType.get()).to.equal('foobar');
      });
    });

    describe('#set', function() {
      it('sets the value of the string', function() {
        stringType.set('hello world');
        expect(stringType.get()).to.equal('hello world');
      });
    });
  });

  describe('NumberType', function() {
    let numberType;

    before(function() {
      numberType = new minim.NumberType(4);
    });

    describe('#elementType', function() {
      it('is a boolean', function() {
        expect(numberType.element).to.equal('number');
      });
    });

    describe('#toValue', function() {
      it('returns the number', function() {
        expect(numberType.toValue()).to.equal(4);
      });
    });

    describe('#toRefract', function() {
      const expected = {
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
      const expected = ['number', {}, {}, 4];

      it('returns a number Compact DOM object', function() {
        expect(numberType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the number value', function() {
        expect(numberType.get()).to.equal(4);
      });
    });

    describe('#set', function() {
      it('sets the value of the number', function() {
        numberType.set(10);
        expect(numberType.get()).to.equal(10);
      });
    });
  });

  describe('BoolType', function() {
    let boolType;

    before(function() {
      boolType = new minim.BooleanType(true);
    });

    describe('#elementType', function() {
      it('is a boolean', function() {
        expect(boolType.element).to.equal('boolean');
      });
    });

    describe('#toValue', function() {
      it('returns the boolean', function() {
        expect(boolType.toValue()).to.equal(true);
      });
    });

    describe('#toRefract', function() {
      const expected = {
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
      const expected = ['boolean', {}, {}, true];

      it('returns a boolean Compact DOM object', function() {
        expect(boolType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the boolean value', function() {
        expect(boolType.get()).to.equal(true);
      });
    });

    describe('#set', function() {
      it('sets the value of the boolean', function() {
        boolType.set(false);
        expect(boolType.get()).to.equal(false);
      });
    });
  });

  describe('Collection', function() {
    describe('searching', function() {
      const refract = {
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
      let strings;
      let recursiveStrings;

      before(function() {
        const doc = minim.convertFromRefract(refract);
        strings = doc.children(el => el.element === 'string');
        recursiveStrings = doc.find(el => el.element === 'string');
      });

      describe('#children', function () {
        it('returns the correct number of items', function() {
          expect(strings.length).to.equal(2);
        });

        it('returns the correct values', function() {
          expect(strings.toValue()).to.deep.equal(['foobar', 'hello world']);
        });
      });

      describe('#find', function () {
        it('returns the correct number of items', function() {
          expect(recursiveStrings.length).to.equal(4);
        });

        it('returns the correct values', function() {
          expect(recursiveStrings.toValue()).to.deep.equal(['foobar', 'hello world', 'baz', 'bar']);
        });
      });
    });
  });

  describe('ArrayType', function() {
    let arrayType, itAddsToArray;

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
      let correctTypes;
      let storedTypes;

      before(function() {
        correctTypes = ['string', 'boolean', 'null', 'number'];
        storedTypes = arrayType.content.map(el => el.element);
      });

      it('stores the correct types', function() {
        expect(storedTypes).to.deep.equal(correctTypes);
      });
    });

    describe('#elementType', function() {
      it('is an array', function() {
        expect(arrayType.element).to.equal('array');
      });
    });

    describe('#toValue', function() {
      it('returns the array', function() {
        expect(arrayType.toValue()).to.deep.equal(['a', true, null, 1]);
      });
    });

    describe('#toRefract', function() {
      const expected = {
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
      const expected = ['array', {}, {}, [['string', {}, {}, 'a'], ['boolean', {}, {}, true], ['null', {}, {}, null], ['number', {}, {}, 1]]];

      it('returns an array Compact DOM object', function() {
        expect(arrayType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      context('when an index is given', function() {
        it('returns the item from the array', function() {
          expect(arrayType.get(0).get()).to.equal('a');
        });
      });

      context('when no index is given', function() {
        it('returns itself', function() {
          expect(arrayType.get().get(0).get()).to.equal('a');
        });
      });
    });

    describe('#set', function() {
      it('sets the value of the array', function() {
        arrayType.set(0, 'hello world');
        expect(arrayType.get(0).get()).to.equal('hello world');
      });
    });

    describe('#map', function() {
      it('allows for mapping the content of the array', function() {
        const newArray = arrayType.map(item => item.get());
        expect(newArray).to.deep.equal(['a', true, null, 1]);
      });
    });

    describe('#filter', function() {
      it('allows for filtering the content', function() {
        const newArray = arrayType.filter(function(item) {
          var ref;
          return (ref = item.get()) === 'a' || ref === 1;
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

    itAddsToArray = function(instance) {
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

    describe('#[Symbol.iterator]', function () {
      it('can be used in a for ... of loop', function () {
        const items = [];
        for (let item of arrayType) {
          items.push(item);
        }

        expect(items).to.have.length(4);
      });
    });
  });

  describe('ObjectType', function() {
    let objectType, itHascollectionMethod;

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
      let correctTypes, storedTypes;

      before(function() {
        correctTypes = ['string', 'number'];
        storedTypes = objectType.content.map(el => el.element);
      });

      it('has the correct types', function() {
        expect(storedTypes).to.deep.equal(correctTypes);
      });
    });

    describe('#elementType', function() {
      it('is a string type', function() {
        expect(objectType.element).to.equal('object');
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
      const expected = {
        element: 'object',
        meta: {},
        attributes: {},
        content: [
          {
            element: 'string',
            meta: {
              name: 'foo'
            },
            attributes: {},
            content: 'bar'
          }, {
            element: 'number',
            meta: {
              name: 'z'
            },
            attributes: {},
            content: 1
          }
        ]
      };

      it('returns an object DOM object', function() {
        expect(objectType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      const expected = [
        'object', {}, {}, [
          [
            'string', {
              name: 'foo'
            }, {}, 'bar'
          ], [
            'number', {
              name: 'z'
            }, {}, 1
          ]
        ]
      ];

      it('returns a object Compact DOM object', function() {
        expect(objectType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      context('when a property name is given', function() {
        it('returns the value of the name given', function() {
          expect(objectType.get('foo').get()).to.equal('bar');
        });
      });

      context('when a property name is not given', function() {
        it('returns itself', function() {
          expect(objectType.get().get('foo').get()).to.equal('bar');
        });
      });
    });

    describe('#set', function() {
      it('sets the value of the name given', function() {
        objectType.set('foo', 'hello world');
        expect(objectType.get('foo').get()).to.equal('hello world');
      });

      it('sets a value that has not been defined yet', function() {
        objectType.set('bar', 'hello world');
        expect(objectType.get('bar').get()).to.equal('hello world');
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

    describe('#items', function () {
      it('provides a list of name/value pairs to iterate', function () {
        const keys = [];
        const values = [];

        for (let [key, value] of objectType.items()) {
          keys.push(key);
          values.push(value);
        }

        expect(keys).to.have.members(['foo', 'z']);
        expect(values).to.have.length(2);
      });
    });

    itHascollectionMethod = function(method) {
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

    describe('#[Symbol.iterator]', function () {
      it('can be used in a for ... of loop', function () {
        const items = [];
        for (let item of objectType) {
          items.push(item);
        }

        expect(items).to.have.length(2);
      });
    });
  });
});
