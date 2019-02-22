const { expect } = require('../spec-helper');
const minim = require('../../lib/minim').namespace();

const NullElement = minim.getElementClass('null');

describe('NullElement', () => {
  let nullElement;

  before(() => {
    nullElement = new NullElement();
  });

  describe('#element', () => {
    it('is null', () => {
      expect(nullElement.element).to.equal('null');
    });
  });

  describe('#primitive', () => {
    it('returns null as the Refract primitive', () => {
      expect(nullElement.primitive()).to.equal('null');
    });
  });

  describe('#get', () => {
    it('returns the null value', () => {
      expect(nullElement.toValue()).to.equal(null);
    });
  });

  describe('#set', () => {
    it('cannot set the value', () => {
      expect(nullElement.set('foobar')).to.be.an.instanceof(Error);
    });
  });
});
