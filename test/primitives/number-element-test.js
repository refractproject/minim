const { expect } = require('../spec-helper');
const minim = require('../../src/minim').namespace();

const NumberElement = minim.getElementClass('number');

describe('NumberElement', function () {
  let numberElement;

  before(function () {
    numberElement = new NumberElement(4);
  });

  describe('#element', function () {
    it('is a number', function () {
      expect(numberElement.element).to.equal('number');
    });
  });

  describe('#primitive', function () {
    it('returns number as the Refract primitive', function () {
      expect(numberElement.primitive()).to.equal('number');
    });
  });

  describe('#get', function () {
    it('returns the number value', function () {
      expect(numberElement.toValue()).to.equal(4);
    });
  });

  describe('#set', function () {
    it('sets the value of the number', function () {
      numberElement.set(10);
      expect(numberElement.toValue()).to.equal(10);
    });
  });
});
