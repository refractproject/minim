import {expect} from './spec-helper';
import minim from '../lib/minim';
import {TypeRegistry} from '../lib/registry';

describe('Minim registry', () => {
  const registry = new TypeRegistry();

  describe('#register', () => {
    it('should add to the element map', () => {
      registry.register('test', minim.ObjectType);
      expect(registry.elementMap.test).to.equal(minim.ObjectType);
    });
  });

  describe('#unregister', () => {
    it('should remove from the element map', () => {
      registry.unregister('test');
      expect(registry.elementMap).to.not.have.key('test');
    });
  });

  describe('#detect', () => {
    const test = () => true;
    registry.typeDetection = [[test, minim.NullType]];

    it('should prepend by default', () => {
      registry.detect(test, minim.StringType);
      expect(registry.typeDetection[0][1]).to.equal(minim.StringType);
    });

    it('should be able to append', () => {
      registry.detect(test, minim.ObjectType, false);
      expect(registry.typeDetection[2][1]).to.equal(minim.ObjectType);
    });
  });

  describe('#toType', () => {
    it('should handle values that are ElementClass subclass instances', () => {
      const myType = new minim.StringType();
      const converted = registry.toType(myType);

      expect(converted).to.equal(myType);
    });

    it('should allow for roundtrip conversions for value types', () => {
      registry.register('foo', minim.StringType);

      // Full version
      const fullVersion = registry.fromRefract({ element: 'foo', meta: {}, attributes: {}, content: 'test' }).toRefract();
      expect(fullVersion).to.deep.equal({ element: 'foo', meta: {}, attributes: {}, content: 'test' });

      // Compact version
      const compactValue = registry.fromCompactRefract(['foo', {}, {}, 'test']).toCompactRefract();
      expect(compactValue).to.deep.equal(['foo', {}, {}, 'test']);
    });

    it('should allow for roundtrip conversions for collection types', () => {
      registry.register('foo', minim.ArrayType);

      const fullRefractSample = {
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

      const compactRefractSample = [
        'foo', {}, {}, [
          ['string', {}, {}, 'bar']
        ]
      ]

      // Full version
      const fullVersion = registry.fromRefract(fullRefractSample).toRefract();
      expect(fullVersion).to.deep.equal(fullRefractSample);

      // Compact version
      const compactValue = registry.fromCompactRefract(compactRefractSample).toCompactRefract();
      expect(compactValue).to.deep.equal(compactRefractSample);
    });
  });

  describe('#getElementClass', () => {
    it('should return ElementClass for unknown elements', () => {
      expect(registry.getElementClass('unknown')).to.equal(minim.ElementType);
    });
  });
});
