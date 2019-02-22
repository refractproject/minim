const { expect } = require('../spec-helper');
const minim = require('../../lib/minim').namespace();

const NumberElement = minim.getElementClass('number');

describe('NumberElement', () => {
  let numberElement;

  before(() => {
    numberElement = new NumberElement(4);
  });

  describe('#element', () => {
    it('is a number', () => {
      expect(numberElement.element).to.equal('number');
    });
  });

  describe('#primitive', () => {
    it('returns number as the Refract primitive', () => {
      expect(numberElement.primitive()).to.equal('number');
    });
  });

  describe('#get', () => {
    it('returns the number value', () => {
      expect(numberElement.toValue()).to.equal(4);
    });
  });

  describe('#set', () => {
    it('sets the value of the number', () => {
      numberElement.set(10);
      expect(numberElement.toValue()).to.equal(10);
    });
  });
});
