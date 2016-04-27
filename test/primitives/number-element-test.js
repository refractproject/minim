var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var NumberElement = minim.getElementClass('number');

describe('NumberElement', function() {
  var numberElement;

  before(function() {
    numberElement = new NumberElement(4);
  });

  describe('#element', function() {
    it('is a number', function() {
      expect(numberElement.element).to.equal('number');
    });
  });

  describe('#primitive', function() {
    it('returns number as the Refract primitive', function() {
      expect(numberElement.primitive()).to.equal('number');
    });
  });

  describe('#toValue', function() {
    it('returns the number', function() {
      expect(numberElement.toValue()).to.equal(4);
    });
  });

  describe('#toRefract', function() {
    var expected = {
      element: 'number',
      meta: {},
      attributes: {},
      content: 4
    };

    it('returns a number element', function() {
      expect(numberElement.toRefract()).to.deep.equal(expected);
    });
  });

  describe('#get', function() {
    it('returns the number value', function() {
      expect(numberElement.toValue()).to.equal(4);
    });
  });

  describe('#set', function() {
    it('sets the value of the number', function() {
      numberElement.set(10);
      expect(numberElement.toValue()).to.equal(10);
    });
  });

  describe('#clone', function() {
    it('creates a deep clone of the element', function() {
      var clone = numberElement.clone();
      expect(clone).to.be.instanceOf(NumberElement);
      expect(clone).to.not.equal(numberElement);
      expect(clone.toRefract()).to.deep.equal(numberElement.toRefract());
    });
  });
});
