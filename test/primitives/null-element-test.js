var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var NullElement = minim.getElementClass('null');

describe('NullElement', function() {
  var nullElement;

  before(function() {
    nullElement = new NullElement();
  });

  describe('#element', function() {
    it('is null', function() {
      expect(nullElement.element).to.equal('null');
    });
  });

  describe('#primitive', function() {
    it('returns null as the Refract primitive', function() {
      expect(nullElement.primitive()).to.equal('null');
    });
  });

  describe('#toValue', function() {
    it('returns null', function() {
      expect(nullElement.toValue()).to.equal(null);
    });
  });

  describe('#toRefract', function() {
    var expected = {
      element: 'null',
      meta: {},
      attributes: {},
      content: null
    };

    it('returns a null element', function() {
      expect(nullElement.toRefract()).to.deep.equal(expected);
    });
  });

  describe('#get', function() {
    it('returns the null value', function() {
      expect(nullElement.toValue()).to.equal(null);
    });
  });

  describe('#set', function() {
    it('cannot set the value', function() {
      expect(nullElement.set('foobar')).to.be.an.instanceof(Error);
    });
  });

  describe('#clone', function() {
    it('creates a deep clone of the element', function() {
      var clone = nullElement.clone();
      expect(clone).to.be.instanceOf(NullElement);
      expect(clone).to.not.equal(nullElement);
      expect(clone.toRefract()).to.deep.equal(nullElement.toRefract());
    });
  });
});
