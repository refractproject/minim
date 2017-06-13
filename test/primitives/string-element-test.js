var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var StringElement = minim.getElementClass('string');

describe('StringElement', function() {
  var stringElement;

  before(function() {
    stringElement = new StringElement('foobar');
  });

  describe('#element', function() {
    it('is a string', function() {
      expect(stringElement.element).to.equal('string');
    });
  });

  describe('#primitive', function() {
    it('returns string as the Refract primitive', function() {
      expect(stringElement.primitive()).to.equal('string');
    });
  });

  describe('#get', function() {
    it('returns the string value', function() {
      expect(stringElement.toValue()).to.equal('foobar');
    });
  });

  describe('#set', function() {
    it('sets the value of the string', function() {
      stringElement.set('hello world');
      expect(stringElement.toValue()).to.equal('hello world');
    });
  });

  describe('#length', function() {
    it('returns the length of the string', function() {
      expect(stringElement.length).to.equal(11);
    });
  });
});
