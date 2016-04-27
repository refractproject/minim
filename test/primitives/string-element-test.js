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

  describe('#toValue', function() {
    it('returns the string', function() {
      expect(stringElement.toValue()).to.equal('foobar');
    });
  });

  describe('#toRefract', function() {
    var expected = {
      element: 'string',
      meta: {},
      attributes: {},
      content: 'foobar'
    };

    it('returns a string element', function() {
      expect(stringElement.toRefract()).to.deep.equal(expected);
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

  describe('#clone', function() {
    it('creates a deep clone of the element', function() {
      var clone = stringElement.clone();
      expect(clone).to.be.instanceOf(StringElement);
      expect(clone).to.not.equal(stringElement);
      expect(clone.toRefract()).to.deep.equal(stringElement.toRefract());
    });
  });
});
