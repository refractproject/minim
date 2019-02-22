const { expect } = require('./spec-helper');
const minim = require('../src/minim').namespace();

const ArrayElement = minim.getElementClass('array');
const StringElement = minim.getElementClass('string');

describe('Minim subclasses', () => {
  class MyElement extends minim.elements.String {
    constructor(content, meta, attributes) {
      super(content, meta, attributes);
      this.element = 'myElement';
    }

    ownMethod() {
      return 'It works!';
    }
  }
  minim.register(MyElement);

  it('can extend the base element with its own method', () => {
    const myElement = new MyElement();
    expect(myElement.ownMethod()).to.equal('It works!');
  });

  context('when initializing', () => {
    const myElement = new MyElement();

    it('can overwrite the element name', () => {
      expect(myElement.element).to.equal('myElement');
    });

    it('returns the correct primitive element', () => {
      expect(myElement.primitive()).to.equal('string');
    });
  });

  describe('deserializing attributes', () => {
    const myElement = minim.fromRefract({
      element: 'myElement',
      attributes: {
        headers: {
          element: 'array',
          content: [
            {
              element: 'string',
              meta: {
                name: {
                  element: 'string',
                  content: 'Content-Type',
                },
              },
              content: 'application/json',
            },
          ],
        },
        foo: {
          element: 'string',
          content: 'bar',
        },
        sourceMap: {
          element: 'sourceMap',
          content: [
            {
              element: 'string',
              content: 'test',
            },
          ],
        },
      },
    });

    it('should create headers element instance', () => {
      expect(myElement.attributes.get('headers')).to.be.instanceof(ArrayElement);
    });

    it('should leave foo alone', () => {
      expect(myElement.attributes.get('foo')).to.be.instanceof(StringElement);
    });

    it('should create array of source map elements', () => {
      const sourceMaps = myElement.attributes.get('sourceMap');
      expect(sourceMaps.content).to.have.length(1);
      expect(sourceMaps.content[0]).to.be.instanceOf(StringElement);
      expect(sourceMaps.content[0].toValue()).to.equal('test');
    });
  });

  describe('serializing attributes', () => {
    const myElement = new MyElement();

    myElement.attributes.set('headers', new ArrayElement(['application/json']));
    myElement.attributes.get('headers').content[0].meta.set('name', 'Content-Type');

    myElement.attributes.set('sourceMap', ['string1', 'string2']);

    it('should serialize element to JSON', () => {
      const refracted = minim.serialiser.serialise(myElement);

      expect(refracted).to.deep.equal({
        element: 'myElement',
        attributes: {
          headers: {
            element: 'array',
            content: [
              {
                element: 'string',
                meta: {
                  name: {
                    element: 'string',
                    content: 'Content-Type',
                  },
                },
                content: 'application/json',
              },
            ],
          },
          sourceMap: {
            element: 'array',
            content: [
              {
                element: 'string',
                content: 'string1',
              },
              {
                element: 'string',
                content: 'string2',
              },
            ],
          },
        },
      });
    });

    it('should round-trip using JSON serialiser', () => {
      const object = minim.serialiser.serialise(myElement);
      const element = minim.serialiser.deserialise(object);
      const serialised = minim.serialiser.serialise(element);

      expect(serialised).to.deep.equal(object);
    });
  });
});
