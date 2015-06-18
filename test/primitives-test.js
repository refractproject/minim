var _ = require('lodash');
var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');

describe('Minim Primitives', function() {
  describe('BaseElement', function() {
    context('when initializing', function() {
      var el;

      before(function() {
        el = new minim.BaseElement({}, {
          id: 'foobar',
          class: ['a', 'b'],
          title: 'Title',
          description: 'Description'
        });
      });

      it('should initialize the correct meta data', function() {
        expect(el.id.toValue()).to.equal('foobar');
        expect(el.class.toValue()).to.deep.equal(['a', 'b']);
        expect(el.title.toValue()).to.equal('Title');
        expect(el.description.toValue()).to.equal('Description');
      });
    });

    describe('#element', function() {
      context('when getting an element that has not been set', function() {
        var el;

        before(function() {
          el = new minim.BaseElement();
        });

        it('returns base element', function() {
          expect(el.element).to.equal('element');
        });
      });

      context('when setting the element', function() {
        var el;

        before(function() {
          el = new minim.BaseElement();
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
        el = new minim.BaseElement({
          foo: 'bar'
        }, {
          id: 'foobar'
        });
      });

      it('returns true when they are equal', function() {
        expect(el.id.equals('foobar')).to.be.true;
      });

      it('returns false when they are not equal', function() {
        expect(el.id.equals('not-equal')).to.be.false;
      });

      it('does a deep equality check', function() {
        expect(el.equals({ foo: 'bar'})).to.be.true;
        expect(el.equals({ foo: 'baz'})).to.be.false;
      });
    });

    describe('convenience methods', function() {
      var meta = {
        id: 'foobar',
        'class': ['a'],
        title: 'A Title',
        description: 'A Description'
      };

      context('when the meta is already set', function() {
        var el = new minim.BaseElement(null, _.clone(meta));

        _.forEach(_.keys(meta), function(key) {
          it('provides a convenience method for ' + key, function() {
            expect(el[key].toValue()).to.deep.equal(meta[key]);
          });
        });
      });

      context('when meta is set with getters and setters', function() {
        var el = new minim.BaseElement(null);

        _.forEach(_.keys(meta), function(key) {
          el[key] = meta[key];

          it('works for getters and setters for ' + key, function() {
            expect(el[key].toValue()).to.deep.equal(meta[key]);
          });

          it('stores the correct data in meta for ' + key, function() {
            expect(el.meta.get(key).toValue()).to.deep.equal(meta[key])
          });
        });
      });
    });
  });

  describe('convertToElement', function() {
    function elementCheck(name, val) {
      var returnedElement;

      context('when given ' + name, function() {
        before(function() {
          returnedElement = minim.convertToElement(val);
        });

        it('returns ' + name, function() {
          expect(returnedElement.element).to.equal(name);
        });
      });
    }

    elementCheck('null', null);
    elementCheck('string', 'foobar');
    elementCheck('number', 1);
    elementCheck('boolean', true);
    elementCheck('array', [1, 2, 3]);
    elementCheck('object', {
      foo: 'bar'
    });
  });

  describe('convertFromElement', function() {
    function elementCheck(name, el) {
      context('when given ' + name, function() {
        var returnedElement;

        before(function() {
          returnedElement = minim.convertFromRefract(el);
        });

        it('returns ' + name + ' element', function() {
          expect(returnedElement.element).to.equal(name);
        });

        it('has the correct value', function() {
          expect(returnedElement.toValue()).to.equal(el.content);
        });
      });

      context('when given compact ' + name, function() {
        var returnedElement;

        before(function() {
          // NOTE: If this is ever giving you issues, remember that it
          //       does NOT handle nested long-form elements.
          returnedElement = minim.convertFromCompactRefract([
            el.element, el.metadata, el.attributes, el.content
          ]);
        });

        it('returns ' + name + ' element', function() {
          expect(returnedElement.element).to.equal(name);
        });

        it('has the correct value', function() {
          expect(returnedElement.toValue()).to.equal(el.content);
        });
      });
    }

    elementCheck('null', {
      element: 'null',
      content: null
    });

    elementCheck('string', {
      element: 'string',
      content: 'foo'
    });

    elementCheck('number', {
      element: 'number',
      content: 4
    });

    elementCheck('boolean', {
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
      var returnedElement;

      before(function() {
        returnedElement = minim.convertFromRefract(el);
      });

      it('returns array element', function() {
        expect(returnedElement.element).to.equal('array');
      });

      it('has the correct values', function() {
        expect(returnedElement.toValue()).to.deep.equal([1, 2]);
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
      var returnedElement;

      before(function() {
        returnedElement = minim.convertFromRefract(el);
      });

      it('returns object element', function() {
        expect(returnedElement.element).to.equal('object');
      });

      it('has the correct values', function() {
        expect(returnedElement.toValue()).to.deep.equal({
          foo: 'bar',
          z: 2
        });
      });
    });
  });

  describe('NullElement', function() {
    var nullElement;

    before(function() {
      nullElement = new minim.NullElement();
    });

    describe('#element', function() {
      it('is null', function() {
        expect(nullElement.element).to.equal('null');
      });
    });

    describe('#primitive', function() {
      it('returns null as the Refract primitive', function() {
        expect(nullElement.primitive()).to.equal('null');
      });
    });

    describe('#toValue', function() {
      it('returns null', function() {
        expect(nullElement.toValue()).to.equal(null);
      });
    });

    describe('#toRefract', function() {
      var expected = {
        element: 'null',
        meta: {},
        attributes: {},
        content: null
      };

      it('returns a null element', function() {
        expect(nullElement.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['null', {}, {}, null];
      it('returns a null Compact Element', function() {
        expect(nullElement.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the null value', function() {
        expect(nullElement.toValue()).to.equal(null);
      });
    });

    describe('#set', function() {
      it('cannot set the value', function() {
        expect(nullElement.set('foobar')).to.be.an.instanceof(Error);
      });
    });
  });

  describe('StringElement', function() {
    var stringElement;

    before(function() {
      stringElement = new minim.StringElement('foobar');
    });

    describe('#element', function() {
      it('is a string', function() {
        expect(stringElement.element).to.equal('string');
      });
    });

    describe('#primitive', function() {
      it('returns string as the Refract primitive', function() {
        expect(stringElement.primitive()).to.equal('string');
      });
    });

    describe('#toValue', function() {
      it('returns the string', function() {
        expect(stringElement.toValue()).to.equal('foobar');
      });
    });

    describe('#toRefract', function() {
      var expected = {
        element: 'string',
        meta: {},
        attributes: {},
        content: 'foobar'
      };

      it('returns a string element', function() {
        expect(stringElement.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['string', {}, {}, 'foobar'];

      it('returns a string Compact element', function() {
        expect(stringElement.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the string value', function() {
        expect(stringElement.toValue()).to.equal('foobar');
      });
    });

    describe('#set', function() {
      it('sets the value of the string', function() {
        stringElement.set('hello world');
        expect(stringElement.toValue()).to.equal('hello world');
      });
    });
  });

  describe('NumberElement', function() {
    var numberElement;

    before(function() {
      numberElement = new minim.NumberElement(4);
    });

    describe('#element', function() {
      it('is a number', function() {
        expect(numberElement.element).to.equal('number');
      });
    });

    describe('#primitive', function() {
      it('returns number as the Refract primitive', function() {
        expect(numberElement.primitive()).to.equal('number');
      });
    });

    describe('#toValue', function() {
      it('returns the number', function() {
        expect(numberElement.toValue()).to.equal(4);
      });
    });

    describe('#toRefract', function() {
      var expected = {
        element: 'number',
        meta: {},
        attributes: {},
        content: 4
      };

      it('returns a number element', function() {
        expect(numberElement.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['number', {}, {}, 4];

      it('returns a number Compact element', function() {
        expect(numberElement.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the number value', function() {
        expect(numberElement.toValue()).to.equal(4);
      });
    });

    describe('#set', function() {
      it('sets the value of the number', function() {
        numberElement.set(10);
        expect(numberElement.toValue()).to.equal(10);
      });
    });
  });

  describe('BooleanElement', function() {
    var booleanElement;

    before(function() {
      booleanElement = new minim.BooleanElement(true);
    });

    describe('#element', function() {
      it('is a boolean', function() {
        expect(booleanElement.element).to.equal('boolean');
      });
    });

    describe('#primitive', function() {
      it('returns boolean as the Refract primitive', function() {
        expect(booleanElement.primitive()).to.equal('boolean');
      });
    });

    describe('#toValue', function() {
      it('returns the boolean', function() {
        expect(booleanElement.toValue()).to.equal(true);
      });
    });

    describe('#toRefract', function() {
      var expected = {
        element: 'boolean',
        meta: {},
        attributes: {},
        content: true
      };

      it('returns a boolean element', function() {
        expect(booleanElement.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['boolean', {}, {}, true];

      it('returns a boolean Compact element', function() {
        expect(booleanElement.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      it('returns the boolean value', function() {
        expect(booleanElement.toValue()).to.equal(true);
      });
    });

    describe('#set', function() {
      it('sets the value of the boolean', function() {
        booleanElement.set(false);
        expect(booleanElement.toValue()).to.equal(false);
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
                meta: {
                  'class': ['test-class']
                },
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
          expect(recursiveStrings).to.have.lengthOf(4);
        });

        it('returns the correct values', function() {
          expect(recursiveStrings.toValue()).to.deep.equal(['foobar', 'hello world', 'baz', 'bar']);
        });
      });

      describe('#findByElement', function() {
        var items;

        before(function() {
          items = doc.findByElement('number');
        });

        it('returns the correct number of items', function() {
          expect(items).to.have.lengthOf(1);
        });

        it('returns the correct values', function() {
          expect(items.toValue()).to.deep.equal([4]);
        });
      });

      describe('#findByClass', function() {
        var items;

        before(function() {
          items = doc.findByClass('test-class');
        });

        it('returns the correct number of items', function() {
          expect(items).to.have.lengthOf(1);
        });

        it('returns the correct values', function() {
          expect(items.toValue()).to.deep.equal(['baz']);
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

  describe('ArrayElement', function() {
    var arrayElement;

    function setArray() {
      arrayElement = new minim.ArrayElement(['a', true, null, 1]);
    }

    before(function() {
      setArray();
    });

    beforeEach(function() {
      setArray();
    });

    describe('.content', function() {
      var correctElementNames;
      var storedElementNames;

      before(function() {
        correctElementNames = ['string', 'boolean', 'null', 'number'];
        storedElementNames = arrayElement.content.map(function(el) {
          return el.element;
        });
      });

      it('stores the correct elements', function() {
        expect(storedElementNames).to.deep.equal(correctElementNames);
      });
    });

    describe('#element', function() {
      it('is an array', function() {
        expect(arrayElement.element).to.equal('array');
      });
    });

    describe('#primitive', function() {
      it('returns array as the Refract primitive', function() {
        expect(arrayElement.primitive()).to.equal('array');
      });
    });

    describe('#toValue', function() {
      it('returns the array', function() {
        expect(arrayElement.toValue()).to.deep.equal(['a', true, null, 1]);
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

      it('returns an array element', function() {
        expect(arrayElement.toRefract()).to.deep.equal(expected);
      });
    });

    describe('#toCompactRefract', function() {
      var expected = ['array', {}, {}, [['string', {}, {}, 'a'], ['boolean', {}, {}, true], ['null', {}, {}, null], ['number', {}, {}, 1]]];

      it('returns an array Compact element', function() {
        expect(arrayElement.toCompactRefract()).to.deep.equal(expected);
      });
    });

    describe('#get', function() {
      context('when an index is given', function() {
        it('returns the item from the array', function() {
          expect(arrayElement.get(0).toValue()).to.equal('a');
        });
      });

      context('when no index is given', function() {
        it('is undefined', function() {
          expect(arrayElement.get()).to.be.undefined;
        });
      });
    });

    describe('#getValue', function() {
      context('when an index is given', function() {
        it('returns the item from the array', function() {
          expect(arrayElement.getValue(0)).to.equal('a');
        });
      });

      context('when no index is given', function() {
        it('is undefined', function() {
          expect(arrayElement.getValue()).to.be.undefined;
        });
      });
    });

    describe('#set', function() {
      it('sets the value of the array', function() {
        arrayElement.set(0, 'hello world');
        expect(arrayElement.get(0).toValue()).to.equal('hello world');
      });
    });

    describe('#map', function() {
      it('allows for mapping the content of the array', function() {
        var newArray = arrayElement.map(function(item) {
          return item.toValue();
        });
        expect(newArray).to.deep.equal(['a', true, null, 1]);
      });
    });

    describe('#filter', function() {
      it('allows for filtering the content', function() {
        var newArray = arrayElement.filter(function(item) {
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
        arrayElement.forEach(function(item) {
          return results.push(item);
        });
        expect(results.length).to.equal(4);
      });
    });

    describe('#length', function() {
      it('returns the length of the content', function() {
        expect(arrayElement.length).to.equal(4);
      });
    });

    function itAddsToArray(instance) {
      expect(instance.length).to.equal(5);
      expect(instance.get(4).toValue()).to.equal('foobar');
    };

    describe('#push', function() {
      it('adds a new item to the array', function() {
        arrayElement.push('foobar');
        itAddsToArray(arrayElement);
      });
    });

    describe('#add', function() {
      it('adds a new item to the array', function() {
        arrayElement.add('foobar');
        itAddsToArray(arrayElement);
      });
    });

    // describe('#[Symbol.iterator]', function() {
    //   it('can be used in a for ... of loop', function() {
    //     var items = [];
    //     for (let item of ArrayElement) {
    //       items.push(item);
    //     }
    //
    //     expect(items).to.have.length(4);
    //   });
    // });
  });

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

  describe('MemberElement', function() {
    var member = new minim.MemberElement('foo', 'bar', {}, { foo: 'bar' });

    it('correctly sets the key and value', function() {
      expect(member.key.toValue()).to.equal('foo');
      expect(member.value.toValue()).to.equal('bar');
    });

    it('correctly sets the attributes', function() {
      expect(member.attributes.get('foo').toValue()).to.equal('bar');
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
