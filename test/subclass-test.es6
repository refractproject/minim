import {expect} from './spec-helper';
import minim from '../lib/minim';

describe('Minim type subclasses', () => {
  class MyType extends minim.StringType {
    constructor(...args) {
      super(...args);
      this.element = 'myType';
      this[minim.attributeElementKeys] = ['headers'];
    }
  }

  context('when initializing', () => {
    const myType = new MyType();

    it('can overwrite the element name', () => {
      expect(myType.element).to.equal('myType');
    });

    it('returns the correct primitive type', () => {
      expect(myType.primitive()).to.equal('string');
    });
  });

  describe('deserializing attributes', () => {
    const myType = new MyType().fromRefract({
      element: 'myType',
      attributes: {
        headers: {
          element: 'array',
          content: [
            {
              element: 'string',
              meta: {
                name: 'Content-Type'
              },
              content: 'application/json'
            }
          ]
        },
        foo: 'bar'
      }
    });

    it('should create headers element instance', () => {
      expect(myType.attributes.headers).to.be.instanceof(minim.ArrayType);
    });

    it('should leave foo alone', () => {
      expect(myType.attributes.foo).to.be.a('string');
    });
  });

  describe('serializing attributes', () => {
    const myType = new MyType();
    myType.attributes.headers = new minim.ArrayType(['application/json']);
    myType.attributes.headers.content[0].meta.name = 'Content-Type';

    it('should serialize headers element', () => {
      const refracted = myType.toCompactRefract();

      expect(refracted).to.deep.equal(['myType', {}, {
        headers: ['array', {}, {}, [
            ['string', {name: 'Content-Type'}, {}, 'application/json']
        ]]
      }, null]);
    });
  });
});
