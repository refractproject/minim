const { expect } = require('../spec-helper');
const minim = require('../../src/minim').namespace();

const ArrayElement = minim.getElementClass('array');

describe('ArrayElement', () => {
  context('value methods', () => {
    let arrayElement;

    function setArray() {
      arrayElement = new ArrayElement(['a', true, null, 1]);
    }

    before(() => {
      setArray();
    });

    beforeEach(() => {
      setArray();
    });

    describe('.content', () => {
      let correctElementNames;
      let storedElementNames;

      before(() => {
        correctElementNames = ['string', 'boolean', 'null', 'number'];
        storedElementNames = arrayElement.content.map(el => el.element);
      });

      it('stores the correct elements', () => {
        expect(storedElementNames).to.deep.equal(correctElementNames);
      });
    });

    describe('#element', () => {
      it('is an array', () => {
        expect(arrayElement.element).to.equal('array');
      });
    });

    describe('#primitive', () => {
      it('returns array as the Refract primitive', () => {
        expect(arrayElement.primitive()).to.equal('array');
      });
    });

    describe('#get', () => {
      context('when an index is given', () => {
        it('returns the item from the array', () => {
          expect(arrayElement.get(0).toValue()).to.equal('a');
        });
      });

      context('when no index is given', () => {
        it('is undefined', () => {
          expect(arrayElement.get()).to.be.undefined;
        });
      });
    });

    describe('#getValue', () => {
      context('when an index is given', () => {
        it('returns the item from the array', () => {
          expect(arrayElement.getValue(0)).to.equal('a');
        });
      });

      context('when no index is given', () => {
        it('is undefined', () => {
          expect(arrayElement.getValue()).to.be.undefined;
        });
      });
    });

    describe('#getIndex', () => {
      const numbers = new ArrayElement([1, 2, 3, 4]);

      it('returns the correct item', () => {
        expect(numbers.getIndex(1).toValue()).to.equal(2);
      });
    });

    describe('#set', () => {
      it('sets the value of the array', () => {
        arrayElement.set(0, 'hello world');
        expect(arrayElement.get(0).toValue()).to.equal('hello world');
      });
    });

    describe('#map', () => {
      it('allows for mapping the content of the array', () => {
        const newArray = arrayElement.map(item => item.toValue());
        expect(newArray).to.deep.equal(['a', true, null, 1]);
      });
    });

    describe('#flatMap', () => {
      /**
       * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#Examples
       */
      it('provides flatMap to flatten one level', () => {
        const arr1 = new ArrayElement([1, 2, 3, 4]);

        const mapped = arr1.map(x => [x.toValue() * 2]);

        expect(mapped).to.deep.equal([[2], [4], [6], [8]]);

        const flattened = arr1.flatMap(x => [x.toValue() * 2]);

        expect(flattened).to.deep.equal([2, 4, 6, 8]);

        const flattenOnce = arr1.flatMap(x => [[x.toValue() * 2]]);

        expect(flattenOnce).to.deep.equal([[2], [4], [6], [8]]);
      });
    });

    describe('#compactMap', () => {
      it('allows compact mapping the content of the array', () => {
        const newArray = arrayElement.compactMap((item) => {
          if (item.element === 'string' || item.element === 'number') {
            return item.toValue();
          }

          return undefined;
        });
        expect(newArray).to.deep.equal(['a', 1]);
      });
    });

    describe('#filter', () => {
      it('allows for filtering the content', () => {
        const newArray = arrayElement.filter((item) => {
          const ref = item.toValue();
          return ref === 'a' || ref === 1;
        });
        expect(newArray.toValue()).to.deep.equal(['a', 1]);
      });
    });

    describe('#reject', () => {
      it('allows for rejecting the content', () => {
        const newArray = arrayElement.reject((item) => {
          const ref = item.toValue();
          return ref === 'a' || ref === 1;
        });
        expect(newArray.toValue()).to.deep.equal([true, null]);
      });
    });

    describe('#reduce', () => {
      const numbers = new ArrayElement([1, 2, 3, 4]);

      it('sends index and array elements', () => {
        const sum = numbers.reduce((result, item, index, array) => {
          expect(index).to.be.below(numbers.length);
          expect(array).to.equal(numbers);

          return result.toValue() + index;
        }, 0);

        // Sum of indexes should be 0 + 1 + 2 + 3 = 6
        expect(sum.toValue()).to.equal(6);
      });

      context('when no beginning value is given', () => {
        it('correctly reduces the array', () => {
          const total = numbers.reduce((result, item) => result.toValue() + item.toValue());
          expect(total.toValue()).to.equal(10);
        });
      });

      context('when a beginning value is given', () => {
        it('correctly reduces the array', () => {
          const total = numbers.reduce((result, item) => result.toValue() + item.toValue(), 20);
          expect(total.toValue()).to.equal(30);
        });
      });
    });

    describe('#forEach', () => {
      it('iterates over each item', () => {
        const indexes = [];
        const results = [];

        arrayElement.forEach((item, index) => {
          indexes.push(index.toValue());
          results.push(item);
        });

        expect(results.length).to.equal(4);
        expect(indexes).to.deep.equal([0, 1, 2, 3]);
      });
    });

    describe('#length', () => {
      it('returns the length of the content', () => {
        expect(arrayElement.length).to.equal(4);
      });
    });

    describe('#isEmpty', () => {
      it('returns empty when there are no elements', () => {
        expect(new ArrayElement().isEmpty).to.be.true;
      });

      it('returns non empty when there are elements', () => {
        expect(arrayElement.isEmpty).to.be.false;
      });
    });

    describe('#remove', () => {
      it('removes the specified item', () => {
        const removed = arrayElement.remove(0);

        expect(removed.toValue()).to.equal('a');
        expect(arrayElement.length).to.equal(3);
      });

      it('removing unknown item', () => {
        const removed = arrayElement.remove(10);

        expect(removed).to.be.null;
      });
    });

    function itAddsToArray(instance) {
      expect(instance.length).to.equal(5);
      expect(instance.get(4).toValue()).to.equal('foobar');
    }

    describe('#shift', () => {
      it('removes an item from the start of an array', () => {
        const shifted = arrayElement.shift();
        expect(arrayElement.length).to.equal(3);
        expect(shifted.toValue()).to.equal('a');
      });
    });

    describe('#unshift', () => {
      it('adds a new item to the start of the array', () => {
        arrayElement.unshift('foobar');
        expect(arrayElement.length).to.equal(5);
        expect(arrayElement.get(0).toValue()).to.equal('foobar');
      });
    });

    describe('#push', () => {
      it('adds a new item to the end of the array', () => {
        arrayElement.push('foobar');
        itAddsToArray(arrayElement);
      });
    });

    describe('#add', () => {
      it('adds a new item to the array', () => {
        arrayElement.add('foobar');
        itAddsToArray(arrayElement);
      });
    });

    if (typeof Symbol !== 'undefined') {
      describe('#[Symbol.iterator]', () => {
        it('can be used in a for ... of loop', () => {
          // We know the runtime supports Symbol but don't know if it supports
          // the actual `for ... of` loop syntax. Here we simulate it by
          // directly manipulating the iterator the same way that `for ... of`
          // does.
          const items = [];
          const iterator = arrayElement[Symbol.iterator]();
          let result;

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

  describe('searching', () => {
    const refract = {
      element: 'array',
      content: [
        {
          element: 'string',
          content: 'foobar',
        }, {
          element: 'string',
          content: 'hello world',
        }, {
          element: 'array',
          content: [
            {
              element: 'string',
              meta: {
                classes: {
                  element: 'array',
                  content: [
                    {
                      element: 'string',
                      content: 'test-class',
                    },
                  ],
                },
              },
              content: 'baz',
            }, {
              element: 'boolean',
              content: true,
            }, {
              element: 'array',
              content: [
                {
                  element: 'string',
                  meta: {
                    id: {
                      element: 'string',
                      content: 'nested-id',
                    },
                  },
                  content: 'bar',
                }, {
                  element: 'number',
                  content: 4,
                },
              ],
            },
          ],
        },
      ],
    };

    let doc;
    let strings;
    let recursiveStrings;

    before(() => {
      doc = minim.fromRefract(refract);
      strings = doc.children.filter(el => el.element === 'string');
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
        expect(recursiveStrings).to.have.lengthOf(4);
      });

      it('returns the correct values', () => {
        expect(recursiveStrings.toValue()).to.deep.equal(['foobar', 'hello world', 'baz', 'bar']);
      });
    });

    describe('#findByElement', () => {
      let items;

      before(() => {
        items = doc.findByElement('number');
      });

      it('returns the correct number of items', () => {
        expect(items).to.have.lengthOf(1);
      });

      it('returns the correct values', () => {
        expect(items.toValue()).to.deep.equal([4]);
      });
    });

    describe('#findByClass', () => {
      let items;

      before(() => {
        items = doc.findByClass('test-class');
      });

      it('returns the correct number of items', () => {
        expect(items).to.have.lengthOf(1);
      });

      it('returns the correct values', () => {
        expect(items.toValue()).to.deep.equal(['baz']);
      });
    });

    describe('#first', () => {
      it('returns the first item', () => {
        expect(doc.first).to.deep.equal(doc.content[0]);
      });
    });

    describe('#second', () => {
      it('returns the second item', () => {
        expect(doc.second).to.deep.equal(doc.content[1]);
      });
    });

    describe('#last', () => {
      it('returns the last item', () => {
        expect(doc.last).to.deep.equal(doc.content[2]);
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
