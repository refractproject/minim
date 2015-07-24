var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim');

describe('BooleanElement', function() {
  var booleanElement;

  before(function() {
    booleanElement = new minim.BooleanElement(true);
  });

  describe('#element', function() {
    it('is a boolean', function() {
      expect(booleanElement.element).to.equal('boolean');
    });
  });

  describe('#primitive', function() {
    it('returns boolean as the Refract primitive', function() {
      expect(booleanElement.primitive()).to.equal('boolean');
    });
  });

  describe('#toValue', function() {
    it('returns the boolean', function() {
      expect(booleanElement.toValue()).to.equal(true);
    });
  });

  describe('#toRefract', function() {
    var expected = {
      element: 'boolean',
      meta: {},
      attributes: {},
      content: true
    };

    it('returns a boolean element', function() {
      expect(booleanElement.toRefract()).to.deep.equal(expected);
    });
  });

  describe('#toCompactRefract', function() {
    var expected = ['boolean', {}, {}, true];

    it('returns a boolean Compact element', function() {
      expect(booleanElement.toCompactRefract()).to.deep.equal(expected);
    });
  });

  describe('#get', function() {
    it('returns the boolean value', function() {
      expect(booleanElement.toValue()).to.equal(true);
    });
  });

  describe('#set', function() {
    it('sets the value of the boolean', function() {
      booleanElement.set(false);
      expect(booleanElement.toValue()).to.equal(false);
    });
  });

  describe('#clone', function() {
    it('creates a deep clone of the element', function() {
      var clone = booleanElement.clone();
      expect(clone).to.be.instanceOf(minim.BooleanElement);
      expect(clone).to.not.equal(booleanElement);
      expect(clone.toRefract()).to.deep.equal(booleanElement.toRefract());
    });
  });
});
