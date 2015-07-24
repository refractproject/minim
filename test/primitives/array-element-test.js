var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim');

describe('ArrayElement', function() {
  context('value methods', function() {
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

    describe('#getIndex', function() {
      var numbers = new minim.ArrayElement([1, 2, 3, 4]);

      it('returns the correct item', function() {
        expect(numbers.getIndex(1).toValue()).to.equal(2);
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

    describe('#reduce', function() {
      var numbers = new minim.ArrayElement([1, 2, 3, 4]);

      context('when no beginning value is given', function() {
        it('correctly reduces the array', function() {
          var total = numbers.reduce(function(result, item) {
            return result.toValue() + item.toValue();
          });
          expect(total.toValue()).to.equal(10);
        });
      });

      context('when a beginning value is given', function() {
        it('correctly reduces the array', function() {
          var total = numbers.reduce(function(result, item) {
            return result.toValue() + item.toValue();
          }, 20);
          expect(total.toValue()).to.equal(30);
        });
      });
    });

    describe('#forEach', function() {
      it('iterates over each item', function() {
        var indexes = [];
        var results = [];

        arrayElement.forEach(function(item, index) {
          indexes.push(index.toValue());
          results.push(item);
        });

        expect(results.length).to.equal(4);
        expect(indexes).to.deep.equal([0, 1, 2, 3]);
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

    describe('#clone', function() {
      it('creates a deep clone of the element', function() {
        var clone = arrayElement.clone();
        expect(clone).to.be.instanceOf(minim.ArrayElement);
        expect(clone).to.not.equal(arrayElement);
        expect(clone.toRefract()).to.deep.equal(arrayElement.toRefract());
      });
    });
  });

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
