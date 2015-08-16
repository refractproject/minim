var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');
var ElementRegistry = require('../lib/base').ElementRegistry;

describe('Minim registry', function() {
  var registry = new ElementRegistry();
  registry.BaseElement = minim.BaseElement;

  describe('#register', function() {
    it('should add to the element map', function() {
      registry.register('test', minim.ObjectElement);
      expect(registry.elementMap.test).to.equal(minim.ObjectElement);
    });
  });

  describe('#unregister', function() {
    it('should remove from the element map', function() {
      registry.unregister('test');
      expect(registry.elementMap).to.not.have.key('test');
    });
  });

  describe('#detect', function() {
    var test = function() { return true; }
    registry.elementDetection = [[test, minim.NullElement]];

    it('should prepend by default', function() {
      registry.detect(test, minim.StringElement);
      expect(registry.elementDetection[0][1]).to.equal(minim.StringElement);
    });

    it('should be able to append', function() {
      registry.detect(test, minim.ObjectElement, false);
      expect(registry.elementDetection[2][1]).to.equal(minim.ObjectElement);
    });
  });

  describe('#toElement', function() {
    it('should handle values that are ElementClass subclass instances', function() {
      var myElement = new minim.StringElement();
      var converted = registry.toElement(myElement);

      expect(converted).to.equal(myElement);
    });

    it('should allow for roundtrip conversions for values', function() {
      registry.register('foo', minim.StringElement);

      // Full version
      var fullVersion = registry.fromRefract({ element: 'foo', meta: {}, attributes: {}, content: 'test' }).toRefract();
      expect(fullVersion).to.deep.equal({ element: 'foo', meta: {}, attributes: {}, content: 'test' });

      // Compact version
      var compactValue = registry.fromCompactRefract(['foo', {}, {}, 'test']).toCompactRefract();
      expect(compactValue).to.deep.equal(['foo', {}, {}, 'test']);
    });

    it('should allow for roundtrip conversions for collection elements', function() {
      registry.register('foo', minim.ArrayElement);

      var fullRefractSample = {
        element: 'foo',
        meta: {},
        attributes: {},
        content: [
          {
            element: 'string',
            meta: {},
            attributes: {},
            content: 'bar'
          }
        ]
      }

      var compactRefractSample = [
        'foo', {}, {}, [
          ['string', {}, {}, 'bar']
        ]
      ]

      // Full version
      var fullVersion = registry.fromRefract(fullRefractSample).toRefract();
      expect(fullVersion).to.deep.equal(fullRefractSample);

      // Compact version
      var compactValue = registry.fromCompactRefract(compactRefractSample).toCompactRefract();
      expect(compactValue).to.deep.equal(compactRefractSample);
    });
  });

  describe('#getElementClass', function() {
    it('should return ElementClass for unknown elements', function() {
      expect(registry.getElementClass('unknown')).to.equal(minim.BaseElement);
    });
  });
});
