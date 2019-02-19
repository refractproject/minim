const fl = require('fantasy-land');
const { expect } = require('../spec-helper');
const namespace = require('../../src/minim').namespace();

const ArrayElement = namespace.getElementClass('array');

describe('ArrayElement', () => {
  const array = new ArrayElement([1, 2, 3, 4]);

  describe('Functor', () => {
    it('can transform elements into new ArrayElement', () => {
      const result = array[fl.map](n => new namespace.elements.Number(n.toValue() * 2));

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([2, 4, 6, 8]);
    });
  });

  describe('Semigroup', () => {
    it('can concatinate two array elements', () => {
      const result = array[fl.concat](new ArrayElement([5, 6]));

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('Monoid', () => {
    it('can create an empty ArrayElement', () => {
      const result = ArrayElement[fl.empty]();

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([]);
    });

    it('can create an empty ArrayElement from another ArrayElement', () => {
      const result = array[fl.empty]();

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([]);
    });
  });

  describe('Filterable', () => {
    it('can filter all elements into equivilent ArrayElement', () => {
      const result = array[fl.filter](() => true);

      expect(result).to.deep.equal(array);
    });

    it('can filter into empty ArrayElement', () => {
      const result = array[fl.filter](() => false);

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.isEmpty).to.be.true;
    });
  });

  describe('Chain', () => {
    it('can transform and chain results into new ArrayElement', () => {
      const duplicate = n => new ArrayElement([n, n]);
      const result = array[fl.chain](duplicate);

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 1, 2, 2, 3, 3, 4, 4]);
    });
  });

  describe('Foldable', () => {
    it('can reduce results into new ArrayElement', () => {
      const result = array[fl.reduce]((accumulator, element) => accumulator.concat(new ArrayElement([element.toValue(), element.toValue()])), new ArrayElement());

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 1, 2, 2, 3, 3, 4, 4]);
    });
  });
});
