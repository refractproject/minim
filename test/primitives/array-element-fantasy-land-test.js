const fl = require('fantasy-land');
const expect = require('../spec-helper').expect;
const namespace = require('../../src/minim').namespace();

const ArrayElement = namespace.getElementClass('array');

describe('ArrayElement', function () {
  const array = new ArrayElement([1, 2, 3, 4]);

  describe('Functor', function () {
    it('can transform elements into new ArrayElement', function () {
      const result = array[fl.map](function (n) {
        return new namespace.elements.Number(n.toValue() * 2);
      });

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([2, 4, 6, 8]);
    });
  });

  describe('Semigroup', function () {
    it('can concatinate two array elements', function () {
      const result = array[fl.concat](new ArrayElement([5, 6]));

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('Monoid', function () {
    it('can create an empty ArrayElement', function () {
      const result = ArrayElement[fl.empty]();

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([]);
    });

    it('can create an empty ArrayElement from another ArrayElement', function () {
      const result = array[fl.empty]();

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([]);
    });
  });

  describe('Filterable', function () {
    it('can filter all elements into equivilent ArrayElement', function () {
      const result = array[fl.filter](function () { return true; });

      expect(result).to.deep.equal(array);
    });

    it('can filter into empty ArrayElement', function () {
      const result = array[fl.filter](function () { return false; });

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.isEmpty).to.be.true;
    });
  });

  describe('Chain', function () {
    it('can transform and chain results into new ArrayElement', function () {
      const duplicate = function (n) { return new ArrayElement([n, n]); };
      const result = array[fl.chain](duplicate);

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 1, 2, 2, 3, 3, 4, 4]);
    });
  });

  describe('Foldable', function () {
    it('can reduce results into new ArrayElement', function () {
      const result = array[fl.reduce](function (accumulator, element) {
        return accumulator.concat(new ArrayElement([element.toValue(), element.toValue()]));
      }, new ArrayElement());

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 1, 2, 2, 3, 3, 4, 4]);
    });
  });
});
