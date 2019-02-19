const { expect } = require('../spec-helper');
const minim = require('../../src/minim').namespace();

const BooleanElement = minim.getElementClass('boolean');

describe('BooleanElement', () => {
  let booleanElement;

  beforeEach(() => {
    booleanElement = new BooleanElement(true);
  });

  describe('#element', () => {
    it('is a boolean', () => {
      expect(booleanElement.element).to.equal('boolean');
    });
  });

  describe('#primitive', () => {
    it('returns boolean as the Refract primitive', () => {
      expect(booleanElement.primitive()).to.equal('boolean');
    });
  });

  describe('#get', () => {
    it('returns the boolean value', () => {
      expect(booleanElement.toValue()).to.equal(true);
    });
  });

  describe('#set', () => {
    it('sets the value of the boolean', () => {
      booleanElement.set(false);
      expect(booleanElement.toValue()).to.equal(false);
    });
  });
});
