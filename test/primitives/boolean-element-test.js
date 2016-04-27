var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var BooleanElement = minim.getElementClass('boolean');

describe('BooleanElement', function() {
  var booleanElement;

  beforeEach(function() {
    booleanElement = new BooleanElement(true);
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
    var expected;

    it('returns a boolean element', function() {
      expected = {
        element: 'boolean',
        meta: {},
        attributes: {},
        content: true
      };

      expect(booleanElement.toRefract()).to.deep.equal(expected);
    });

    it('includes extra metadata if present', function() {
      expected = {
        element: 'boolean',
        meta: {
          id: {
            element: 'string',
            meta: {},
            attributes: {
              someExtraData: true
            },
            content: 'abc'
          }
        },
        attributes: {},
        content: true
      };
      booleanElement.meta.set('id', 'abc');
      booleanElement.meta.get('id').attributes.set('someExtraData', true);
      expect(booleanElement.toRefract()).to.deep.equal(expected);
    });
  });

  describe('#fromRefract', function() {
    it('can handle optionally refracted metadata', function() {
      booleanElement.fromRefract({
        element: 'boolean',
        meta: {
          id: {
            element: 'string',
            meta: {},
            attributes: {},
            content: 'abc'
          }
        },
        attributes: {},
        content: true
      });

      expect(booleanElement.meta.get('id').toValue()).to.equal('abc');
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
      expect(clone).to.be.instanceOf(BooleanElement);
      expect(clone).to.not.equal(booleanElement);
      expect(clone.toRefract()).to.deep.equal(booleanElement.toRefract());
    });
  });
});
