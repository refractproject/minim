var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');
var TypeRegistry = require('../lib/base').TypeRegistry;

describe('Minim registry', function() {
  var registry = new TypeRegistry();

  describe('#register', function() {
    it('should add to the element map', function() {
      registry.register('test', minim.ObjectType);
      expect(registry.elementMap.test).to.equal(minim.ObjectType);
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
    registry.typeDetection = [[test, minim.NullType]];

    it('should prepend by default', function() {
      registry.detect(test, minim.StringType);
      expect(registry.typeDetection[0][1]).to.equal(minim.StringType);
    });

    it('should be able to append', function() {
      registry.detect(test, minim.ObjectType, false);
      expect(registry.typeDetection[2][1]).to.equal(minim.ObjectType);
    });
  });

  describe('#toType', function() {
    it('should handle values that are ElementClass subclass instances', function() {
      var myType = new minim.StringType();
      var converted = registry.toType(myType);

      expect(converted).to.equal(myType);
    });

    it('should allow for roundtrip conversions for value types', function() {
      registry.register('foo', minim.StringType);

      // Full version
      var fullVersion = registry.fromRefract({ element: 'foo', meta: {}, attributes: {}, content: 'test' }).toRefract();
      expect(fullVersion).to.deep.equal({ element: 'foo', meta: {}, attributes: {}, content: 'test' });

      // Compact version
      var compactValue = registry.fromCompactRefract(['foo', {}, {}, 'test']).toCompactRefract();
      expect(compactValue).to.deep.equal(['foo', {}, {}, 'test']);
    });

    it('should allow for roundtrip conversions for collection types', function() {
      registry.register('foo', minim.ArrayType);

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
      expect(registry.getElementClass('unknown')).to.equal(minim.ElementType);
    });
  });
});
