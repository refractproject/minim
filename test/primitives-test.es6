import {expect} from './spec-helper';
import minim from '../lib/minim';

describe('Minim Primitives', () => {
  describe('ElementType', () => {
    context('when initializing', () => {
      let el;

      before(() => {
        el = new minim.ElementType({}, {
          id: 'foobar',
          'class': ['a', 'b'],
          name: 'MyName',
          title: 'Title',
          description: 'Description'
        });
      });

      it('should initialize the correct meta data', () => {
        expect(el.meta.id.toValue()).to.equal('foobar');
        expect(el.meta.class.toValue()).to.deep.equal(['a', 'b']);
        expect(el.meta.name.toValue()).to.deep.equal('MyName');
        expect(el.meta.title.toValue()).to.equal('Title');
        expect(el.meta.description.toValue()).to.equal('Description');
      });
    });

    describe('#element', () => {
      context('when getting an element that has not been set', () => {
        let el;

        before(() => {
          el = new minim.ElementType();
        });

        it('returns base element', () => {
          expect(el.element).to.equal('element');
        });
      });

      context('when setting the element', () => {
        let el;

        before(() => {
          el = new minim.ElementType();
          el.element = 'foobar';
        });

        it('sets the element correctly', () => {
          expect(el.element).to.equal('foobar');
        });
      })
    });

    describe('#equals', () => {
      let el;

      before(() => {
        el = new minim.ElementType({
          foo: 'bar'
        }, {
          id: 'foobar'
        });
      });

      it('returns true when they are equal', () => {
        expect(el.meta.id.equals('foobar')).to.be.true;
      });

      it('returns false when they are not equal', () => {
        expect(el.meta.id.equals('not-equal')).to.be.false;
      });

      it('does a deep equality check', () => {
        expect(el.equals({ foo: 'bar'})).to.be.true;
        expect(el.equals({ foo: 'baz'})).to.be.false;
      });
    });
  });

  describe('convertToType', () => {
    function typeCheck(name, val) {
      let returnedType;

      context('when given ' + name, () => {
        before(() => {
          returnedType = minim.convertToType(val);
        });

        it('returns ' + name, () => {
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

  describe('convertFromType', () => {
    function typeCheck(name, el) {
      context('when given ' + name, () => {
        let returnedType;

        before(() => {
          returnedType = minim.convertFromRefract(el);
        });

        it('returns ' + name + ' element', () => {
          expect(returnedType.element).to.equal(name);
        });

        it('has the correct value', () => {
          expect(returnedType.toValue()).to.equal(el.content);
        });
      });

      context('when given compact ' + name, () => {
        let returnedType;

        before(() => {
          // NOTE: If this is ever giving you issues, remember that it
          //       does NOT handle nested long-form elements.
          returnedType = minim.convertFromCompactRefract([
            el.element, el.metadata, el.attributes, el.content
          ]);
        });

        it('returns ' + name + ' element', () => {
          expect(returnedType.element).to.equal(name);
        });

        it('has the correct value', () => {
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

    context('when given array', () => {
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

      before(() => {
        returnedType = minim.convertFromRefract(el);
      });

      it('returns array element', () => {
        expect(returnedType.element).to.equal('array');
      });

      it('has the correct values', () => {
        expect(returnedType.toValue()).to.deep.equal([1, 2]);
      });
    });

    context('when given object', () => {
      const el = {
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
      let returnedType;

      before(() => {
        returnedType = minim.convertFromRefract(el);
      });

      it('returns object element', () => {
        expect(returnedType.element).to.equal('object');
      });

      it('has the correct values', () => {
        expect(returnedType.toValue()).to.deep.equal({
          foo: 'bar',
          z: 2
        });
      });
    });
  });

  describe('NullType', () => {
    let nullType;

    before(() => {
      nullType = new minim.NullType();
    });

    describe('#element', () => {
      it('is null', () => {
        expect(nullType.element).to.equal('null');
      });
    });

    describe('#primitive', () => {
      it('returns null as the Refract primitive', () => {
        expect(nullType.primitive()).to.equal('null');
      });
    });

    describe('#toValue', () => {
      it('returns null', () => {
        expect(nullType.toValue()).to.equal(null);
      });
    });

    describe('#toRefract', () => {
      const expected = {
        element: 'null',
        meta: {},
        attributes: {},
        content: null
      };

      it('returns a null DOM object', () => {
        expect(nullType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', () => {
      const expected = ['null', {}, {}, null];
      it('returns a null Compact DOM object', () => {
        expect(nullType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', () => {
      it('returns the null value', () => {
        expect(nullType.toValue()).to.equal(null);
      });
    });

    describe('#set', () => {
      it('cannot set the value', () => {
        expect(nullType.set('foobar')).to.be.an.instanceof(Error);
      });
    });
  });

  describe('StringType', () => {
    let stringType;

    before(() => {
      stringType = new minim.StringType('foobar');
    });

    describe('#element', () => {
      it('is a string', () => {
        expect(stringType.element).to.equal('string');
      });
    });

    describe('#primitive', () => {
      it('returns string as the Refract primitive', () => {
        expect(stringType.primitive()).to.equal('string');
      });
    });

    describe('#toValue', () => {
      it('returns the string', () => {
        expect(stringType.toValue()).to.equal('foobar');
      });
    });

    describe('#toRefract', () => {
      const expected = {
        element: 'string',
        meta: {},
        attributes: {},
        content: 'foobar'
      };

      it('returns a string DOM object', () => {
        expect(stringType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', () => {
      const expected = ['string', {}, {}, 'foobar'];

      it('returns a string Compact DOM object', () => {
        expect(stringType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', () => {
      it('returns the string value', () => {
        expect(stringType.toValue()).to.equal('foobar');
      });
    });

    describe('#set', () => {
      it('sets the value of the string', () => {
        stringType.set('hello world');
        expect(stringType.toValue()).to.equal('hello world');
      });
    });
  });

  describe('NumberType', () => {
    let numberType;

    before(() => {
      numberType = new minim.NumberType(4);
    });

    describe('#element', () => {
      it('is a number', () => {
        expect(numberType.element).to.equal('number');
      });
    });

    describe('#primitive', () => {
      it('returns number as the Refract primitive', () => {
        expect(numberType.primitive()).to.equal('number');
      });
    });

    describe('#toValue', () => {
      it('returns the number', () => {
        expect(numberType.toValue()).to.equal(4);
      });
    });

    describe('#toRefract', () => {
      const expected = {
        element: 'number',
        meta: {},
        attributes: {},
        content: 4
      };

      it('returns a number DOM object', () => {
        expect(numberType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', () => {
      const expected = ['number', {}, {}, 4];

      it('returns a number Compact DOM object', () => {
        expect(numberType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', () => {
      it('returns the number value', () => {
        expect(numberType.toValue()).to.equal(4);
      });
    });

    describe('#set', () => {
      it('sets the value of the number', () => {
        numberType.set(10);
        expect(numberType.toValue()).to.equal(10);
      });
    });
  });

  describe('BoolType', () => {
    let boolType;

    before(() => {
      boolType = new minim.BooleanType(true);
    });

    describe('#element', () => {
      it('is a boolean', () => {
        expect(boolType.element).to.equal('boolean');
      });
    });

    describe('#primitive', () => {
      it('returns boolean as the Refract primitive', () => {
        expect(boolType.primitive()).to.equal('boolean');
      });
    });

    describe('#toValue', () => {
      it('returns the boolean', () => {
        expect(boolType.toValue()).to.equal(true);
      });
    });

    describe('#toRefract', () => {
      const expected = {
        element: 'boolean',
        meta: {},
        attributes: {},
        content: true
      };

      it('returns a boolean DOM object', () => {
        expect(boolType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', () => {
      const expected = ['boolean', {}, {}, true];

      it('returns a boolean Compact DOM object', () => {
        expect(boolType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', () => {
      it('returns the boolean value', () => {
        expect(boolType.toValue()).to.equal(true);
      });
    });

    describe('#set', () => {
      it('sets the value of the boolean', () => {
        boolType.set(false);
        expect(boolType.toValue()).to.equal(false);
      });
    });
  });

  describe('Collection', () => {
    describe('searching', () => {
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

      let doc;
      let strings;
      let recursiveStrings;

      before(() => {
        doc = minim.convertFromRefract(refract);
        strings = doc.children(el => el.element === 'string');
        recursiveStrings = doc.find(el => el.element === 'string');
      });

      describe('#children', () => {
        it('returns the correct number of items', () => {
          expect(strings.length).to.equal(2);
        });

        it('returns the correct values', () => {
          expect(strings.toValue()).to.deep.equal(['foobar', 'hello world']);
        });
      });

      describe('#find', () => {
        it('returns the correct number of items', () => {
          expect(recursiveStrings.length).to.equal(4);
        });

        it('returns the correct values', () => {
          expect(recursiveStrings.toValue()).to.deep.equal(['foobar', 'hello world', 'baz', 'bar']);
        });
      });

      describe('#first', () => {
        it('returns the first item', () => {
          expect(doc.first()).to.deep.equal(doc.content[0]);
        });
      });

      describe('#second', () => {
        it('returns the first item', () => {
          expect(doc.second()).to.deep.equal(doc.content[1]);
        });
      });

      describe('#last', () => {
        it('returns the first item', () => {
          expect(doc.last()).to.deep.equal(doc.content[2]);
        });
      });

      describe('#getById', () => {
        it('returns the item for the ID given', () => {
          expect(doc.getById('nested-id').toValue()).to.equal('bar');
        });
      });

      describe('#contains', () => {
        it('uses deep equality', () => {
          expect(doc.get(2).contains(['not', 'there'])).to.be.false;
          expect(doc.get(2).contains(['bar', 4])).to.be.true;
        });

        context('when given a value that is in the array', () => {
          it('returns true', () => {
            expect(doc.contains('foobar')).to.be.true;
          });
        });

        context('when given a value that is not in the array', () => {
          it('returns false', () => {
            expect(doc.contains('not-there')).to.be.false;
          });
        });
      });
    });
  });

  describe('ArrayType', () => {
    let arrayType;

    function setArray() {
      arrayType = new minim.ArrayType(['a', true, null, 1]);
    }

    before(() => {
      setArray();
    });

    beforeEach(() => {
      setArray();
    });

    describe('.content', () => {
      let correctTypes;
      let storedTypes;

      before(() => {
        correctTypes = ['string', 'boolean', 'null', 'number'];
        storedTypes = arrayType.content.map(el => el.element);
      });

      it('stores the correct types', () => {
        expect(storedTypes).to.deep.equal(correctTypes);
      });
    });

    describe('#element', () => {
      it('is an array', () => {
        expect(arrayType.element).to.equal('array');
      });
    });

    describe('#primitive', () => {
      it('returns array as the Refract primitive', () => {
        expect(arrayType.primitive()).to.equal('array');
      });
    });

    describe('#toValue', () => {
      it('returns the array', () => {
        expect(arrayType.toValue()).to.deep.equal(['a', true, null, 1]);
      });
    });

    describe('#toRefract', () => {
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

      it('returns an array DOM object', () => {
        expect(arrayType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', () => {
      const expected = ['array', {}, {}, [['string', {}, {}, 'a'], ['boolean', {}, {}, true], ['null', {}, {}, null], ['number', {}, {}, 1]]];

      it('returns an array Compact DOM object', () => {
        expect(arrayType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', () => {
      context('when an index is given', () => {
        it('returns the item from the array', () => {
          expect(arrayType.get(0).toValue()).to.equal('a');
        });
      });

      context('when no index is given', () => {
        it('is undefined', () => {
          expect(arrayType.get()).to.be.undefined;
        });
      });
    });

    describe('#set', () => {
      it('sets the value of the array', () => {
        arrayType.set(0, 'hello world');
        expect(arrayType.get(0).toValue()).to.equal('hello world');
      });
    });

    describe('#map', () => {
      it('allows for mapping the content of the array', () => {
        const newArray = arrayType.map(item => item.toValue());
        expect(newArray).to.deep.equal(['a', true, null, 1]);
      });
    });

    describe('#filter', () => {
      it('allows for filtering the content', () => {
        const newArray = arrayType.filter((item) => {
          var ref;
          return (ref = item.toValue()) === 'a' || ref === 1;
        });
        expect(newArray.toValue()).to.deep.equal(['a', 1]);
      });
    });

    describe('#forEach', () => {
      it('iterates over each item', () => {
        var results;
        results = [];
        arrayType.forEach((item) => {
          return results.push(item);
        });
        expect(results.length).to.equal(4);
      });
    });

    describe('#length', () => {
      it('returns the length of the content', () => {
        expect(arrayType.length).to.equal(4);
      });
    });

    function itAddsToArray(instance) {
      expect(instance.length).to.equal(5);
      expect(instance.get(4).toValue()).to.equal('foobar');
    };

    describe('#push', () => {
      it('adds a new item to the array', () => {
        arrayType.push('foobar');
        itAddsToArray(arrayType);
      });
    });

    describe('#add', () => {
      it('adds a new item to the array', () => {
        arrayType.add('foobar');
        itAddsToArray(arrayType);
      });
    });

    describe('#[Symbol.iterator]', () => {
      it('can be used in a for ... of loop', () => {
        const items = [];
        for (let item of arrayType) {
          items.push(item);
        }

        expect(items).to.have.length(4);
      });
    });
  });

  describe('ObjectType', () => {
    let objectType;

    function setObject() {
      objectType = new minim.ObjectType({
        foo: 'bar',
        z: 1
      });
    }

    before(() => {
      setObject();
    });

    beforeEach(() => {
      setObject();
    });

    describe('.content', () => {
      let correctTypes, storedTypes;

      before(() => {
        correctTypes = ['string', 'number'];
        storedTypes = objectType.content.map(el => el.value.element);
      });

      it('has the correct types', () => {
        expect(storedTypes).to.deep.equal(correctTypes);
      });
    });

    describe('#element', () => {
      it('is a string type', () => {
        expect(objectType.element).to.equal('object');
      });
    });

    describe('#primitive', () => {
      it('returns object as the Refract primitive', () => {
        expect(objectType.primitive()).to.equal('object');
      });
    });

    describe('#toValue', () => {
      it('returns the object', () => {
        expect(objectType.toValue()).to.deep.equal({
          foo: 'bar',
          z: 1
        });
      });
    });

    describe('#toRefract', () => {
      const expected = {
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

      it('returns an object DOM object', () => {
        expect(objectType.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', () => {
      const expected = [
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

      it('returns a object Compact DOM object', () => {
        expect(objectType.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', () => {
      context('when a property name is given', () => {
        it('returns the value of the name given', () => {
          expect(objectType.get('foo').toValue()).to.equal('bar');
        });
      });

      context('when a property name is not given', () => {
        it('is undefined', () => {
          expect(objectType.get()).to.be.undefined;
        });
      });
    });

    describe('#getMember', () => {
      context('when a property name is given', () => {
        it('returns the correct member object', () => {
          expect(objectType.getMember('foo').value.toValue()).to.equal('bar');
        });
      });

      context('when a property name is not given', () => {
        it('is undefined', () => {
          expect(objectType.getMember()).to.be.undefined;
        });
      });
    });

    describe('#getKey', () => {
      context('when a property name is given', () => {
        it('returns the correct key object', () => {
          expect(objectType.getKey('foo').toValue()).to.equal('foo');
        });
      });

      context('when a property name given that does not exist', () => {
        it('returns undefined', () => {
          expect(objectType.getKey('not-defined')).to.be.undefined;
        });
      });

      context('when a property name is not given', () => {
        it('returns undefined', () => {
          expect(objectType.getKey()).to.be.undefined;
        });
      });
    });

    describe('#set', () => {
      it('sets the value of the name given', () => {
        expect(objectType.get('foo').toValue()).to.equal('bar');
        objectType.set('foo', 'hello world');
        expect(objectType.get('foo').toValue()).to.equal('hello world');
      });

      it('sets a value that has not been defined yet', () => {
        objectType.set('bar', 'hello world');
        expect(objectType.get('bar').toValue()).to.equal('hello world');
      });
    });

    describe('#keys', () => {
      it('gets the keys of all properties', () => {
        expect(objectType.keys()).to.deep.equal(['foo', 'z']);
      });
    });

    describe('#values', () => {
      it('gets the values of all properties', () => {
        expect(objectType.values()).to.deep.equal(['bar', 1]);
      });
    });

    describe('#hasKey', function() {
      it('checks to see if a key exists', () => {
        expect(objectType.hasKey('foo')).to.be.true;
        expect(objectType.hasKey('does-not-exist')).to.be.false;
      });
    });

    describe('#items', () => {
      it('provides a list of name/value pairs to iterate', () => {
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

    function itHascollectionMethod(method) {
      describe('#' + method, () => {
        it('responds to #' + method, () => {
          expect(objectType).to.respondTo(method);
        });
      });
    };

    itHascollectionMethod('map');
    itHascollectionMethod('filter');
    itHascollectionMethod('forEach');
    itHascollectionMethod('push');
    itHascollectionMethod('add');

    describe('#map', () => {
      it('provides the keys', () => {
        const keys = objectType.map((value, key, member) => {
          return key.toValue();
        });
        expect(keys).to.deep.equal(['foo', 'z']);
      });

      it('provides the values', () => {
        const values = objectType.map((value, key, member) => {
          return value.toValue();
        });
        expect(values).to.deep.equal(['bar', 1]);
      });

      it('provides the members', () => {
        const keys = objectType.map((value, key, member) => {
          return member.key.toValue();
        });
        expect(keys).to.deep.equal(['foo', 'z']);
      });
    });

    describe('#filter', () => {
      it('allows for filtering on keys', () => {
        const foo = objectType.filter((value, key, member) => {
          return key.equals('foo');
        });
        expect(foo.keys()).to.deep.equal(['foo']);
      });

      it('allows for filtering on values', () => {
        const foo = objectType.filter((value, key, member) => {
          return value.equals('bar');
        });
        expect(foo.keys()).to.deep.equal(['foo']);
      });

      it('allows for filtering on members', () => {
        const foo = objectType.filter((value, key, member) => {
          return member.value.equals('bar');
        });
        expect(foo.keys()).to.deep.equal(['foo']);
      });
    });

    describe('#forEach', () => {
      it('provides the keys', () => {
        let keys = [];
        objectType.forEach((value, key, member) => {
          return keys.push(key.toValue());
        });
        expect(keys).to.deep.equal(['foo', 'z']);
      });

      it('provides the values', () => {
        let values = [];
        objectType.forEach((value, key, member) => {
          return values.push(value.toValue());
        });
        expect(values).to.deep.equal(['bar', 1]);
      });

      it('provides the members', () => {
        let keys = [];
        objectType.forEach((value, key, member) => {
          return keys.push(member.key.toValue());
        });
        expect(keys).to.deep.equal(['foo', 'z']);
      });
    });

    describe('#[Symbol.iterator]', () => {
      it('can be used in a for ... of loop', () => {
        const items = [];
        for (let item of objectType) {
          items.push(item);
        }

        expect(items).to.have.length(2);
      });
    });
  });

  describe('MemberType', () => {
    const member = new minim.MemberType('foo', 'bar', {}, { foo: 'bar' });

    it('correctly sets the key and value', () => {
      expect(member.key.toValue()).to.equal('foo');
      expect(member.value.toValue()).to.equal('bar');
    });

    it('correctly sets the attributes', () => {
      expect(member.attributes.foo).to.equal('bar');
    });

    describe('#toRefract', () => {
      it('returns the correct Refract value', () => {
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

    describe('#toCompactRefract', () => {
      it('returns the correct compact Refract value', () => {
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
