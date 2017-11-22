var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var ArrayElement = minim.getElementClass('array');

describe('ArrayElement', function() {
  context('value methods', function() {
    var arrayElement;

    function setArray() {
      arrayElement = new ArrayElement(['a', true, null, 1]);
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
      var numbers = new ArrayElement([1, 2, 3, 4]);

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

    describe('#reject', function() {
      it('allows for rejecting the content', function() {
        var newArray = arrayElement.reject(function(item) {
          var ref;
          return (ref = item.toValue()) === 'a' || ref === 1;
        });
        expect(newArray.toValue()).to.deep.equal([true, null]);
      });
    });

    describe('#reduce', function() {
      var numbers = new ArrayElement([1, 2, 3, 4]);

      it('sends index and array elements', function () {
        var sum = numbers.reduce(function(result, item, index, array) {
          expect(index).to.be.below(numbers.length);
          expect(array).to.equal(numbers);

          return result.toValue() + index;
        }, 0);

        // Sum of indexes should be 0 + 1 + 2 + 3 = 6
        expect(sum.toValue()).to.equal(6);
      });

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

    describe('#isEmpty', function () {
      it('returns empty when there are no elements', function() {
        expect(new ArrayElement().isEmpty).to.be.true;
      });

      it('returns non empty when there are elements', function() {
        expect(arrayElement.isEmpty).to.be.false;
      });
    });

    describe('#remove', function () {
      it('removes the specified item', function () {
        var removed = arrayElement.remove(0);

        expect(removed.toValue()).to.equal('a');
        expect(arrayElement.length).to.equal(3);
      });

      it('removing unknown item', function () {
        var removed = arrayElement.remove(10);

        expect(removed).to.be.null;
      });
    });

    function itAddsToArray(instance) {
      expect(instance.length).to.equal(5);
      expect(instance.get(4).toValue()).to.equal('foobar');
    };

    describe('#shift', function() {
      it('removes an item from the start of an array', function() {
        var shifted = arrayElement.shift();
        expect(arrayElement.length).to.equal(3);
        expect(shifted.toValue()).to.equal('a');
      });
    });

    describe('#unshift', function() {
      it('adds a new item to the start of the array', function() {
        arrayElement.unshift('foobar');
        expect(arrayElement.length).to.equal(5);
        expect(arrayElement.get(0).toValue()).to.equal('foobar');
      });
    });

    describe('#push', function() {
      it('adds a new item to the end of the array', function() {
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

    if (typeof Symbol !== 'undefined') {
      describe('#[Symbol.iterator]', function() {
        it('can be used in a for ... of loop', function() {
          // We know the runtime supports Symbol but don't know if it supports
          // the actual `for ... of` loop syntax. Here we simulate it by
          // directly manipulating the iterator the same way that `for ... of`
          // does.
          var items = [];
          var iterator = arrayElement[Symbol.iterator]();
          var result;

          do {
            result = iterator.next();

            if (!result.done) {
              items.push(result.value);
            }
          } while (!result.done);

          expect(items).to.have.length(4);
        });
      });
    }
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
                'classes': {
                  element: 'array',
                  content: [
                    {
                      element: 'string',
                      content: 'test-class'
                    },
                  ],
                },
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
                    id: {
                      element: 'string',
                      content: 'nested-id',
                    }
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
      doc = minim.fromRefract(refract);
      strings = doc.children.filter(function(el) {
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
        expect(doc.first).to.deep.equal(doc.content[0]);
      });
    });

    describe('#second', function() {
      it('returns the second item', function() {
        expect(doc.second).to.deep.equal(doc.content[1]);
      });
    });

    describe('#last', function() {
      it('returns the last item', function() {
        expect(doc.last).to.deep.equal(doc.content[2]);
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
