const { expect } = require('../spec-helper');
const minim = require('../../lib/minim').namespace();

const StringElement = minim.getElementClass('string');

describe('StringElement', () => {
  let stringElement;

  before(() => {
    stringElement = new StringElement('foobar');
  });

  describe('#element', () => {
    it('is a string', () => {
      expect(stringElement.element).to.equal('string');
    });
  });

  describe('#primitive', () => {
    it('returns string as the Refract primitive', () => {
      expect(stringElement.primitive()).to.equal('string');
    });
  });

  describe('#get', () => {
    it('returns the string value', () => {
      expect(stringElement.toValue()).to.equal('foobar');
    });
  });

  describe('#set', () => {
    it('sets the value of the string', () => {
      stringElement.set('hello world');
      expect(stringElement.toValue()).to.equal('hello world');
    });
  });

  describe('#length', () => {
    it('returns the length of the string', () => {
      expect(stringElement.length).to.equal(11);
    });
  });
});
