var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();


var StringElement = minim.getElementClass('string');
var NullElement = minim.getElementClass('null');
var ArrayElement = minim.getElementClass('array');
var EnumElement = minim.getElementClass('enum');

describe('Enum Element', function() {
  context('when creating it with undefined content', function() {
    var element;

    before(function() {
      element = new EnumElement();
    });

    it('does not set the content', function () {
      expect(element.content).to.be.null;
      expect(element.toValue()).to.equal(null);
    });
  });

  context('when creating it with null content', function() {
    var element;

    before(function() {
      element = new EnumElement(null);
    });

    it('does not set the content', function () {
      expect(element.content).to.be.instanceof(NullElement);
      expect(element.toValue()).to.equal(null);
    });
  });

  context('when creating it with string content', function() {
    var element;

    before(function() {
      element = new EnumElement('foo');
    });

    it('sets the content to string element', function () {
      expect(element.content).to.be.instanceof(StringElement);
      expect(element.toValue()).to.equal('foo');
    });
  });

  context('when setting enumerations with array', function() {
    var element;

    before(function() {
      element = new EnumElement('foo');
      element.enumerations = ['foo', 'bar'];
    });

    it('sets the correct attributes', function() {
      expect(element.attributes.get('enumerations')).to.be.instanceof(ArrayElement);
      expect(element.attributes.get('enumerations').toValue()).to.deep.equal(['foo', 'bar']);
    });

    it('provides convenience method', function() {
      expect(element.enumerations).to.be.instanceof(ArrayElement);
      expect(element.enumerations.toValue()).to.deep.equal(['foo', 'bar']);
    });
  });

  context('when setting enumerations with array element', function() {
    var element;

    before(function() {
      element = new EnumElement('foo');
      element.enumerations = new ArrayElement(['foo', 'bar']);
    });

    it('sets the correct attributes', function() {
      expect(element.attributes.get('enumerations')).to.be.instanceof(ArrayElement);
      expect(element.attributes.get('enumerations').toValue()).to.deep.equal(['foo', 'bar']);
    });

    it('provides convenience method', function() {
      expect(element.enumerations).to.be.instanceof(ArrayElement);
      expect(element.enumerations.toValue()).to.deep.equal(['foo', 'bar']);
    });
  });

  context('when setting enumerations with object', function() {
    var element;

    before(function() {
      element = new EnumElement('foo');
      element.enumerations = { foo: 'bar' };
    });

    it('sets the correct attributes', function() {
      expect(element.attributes.get('enumerations')).to.be.instanceof(ArrayElement);
      expect(element.attributes.get('enumerations').toValue()).to.deep.equal([]);
    });

    it('provides convenience method', function() {
      expect(element.enumerations).to.be.instanceof(ArrayElement);
      expect(element.enumerations.toValue()).to.deep.equal([]);
    });
  });
});
