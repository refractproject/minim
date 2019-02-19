const expect = require('../spec-helper').expect;
const minim = require('../../src/minim').namespace();

const BooleanElement = minim.getElementClass('boolean');

describe('BooleanElement', function () {
  let booleanElement;

  beforeEach(function () {
    booleanElement = new BooleanElement(true);
  });

  describe('#element', function () {
    it('is a boolean', function () {
      expect(booleanElement.element).to.equal('boolean');
    });
  });

  describe('#primitive', function () {
    it('returns boolean as the Refract primitive', function () {
      expect(booleanElement.primitive()).to.equal('boolean');
    });
  });

  describe('#get', function () {
    it('returns the boolean value', function () {
      expect(booleanElement.toValue()).to.equal(true);
    });
  });

  describe('#set', function () {
    it('sets the value of the boolean', function () {
      booleanElement.set(false);
      expect(booleanElement.toValue()).to.equal(false);
    });
  });
});
