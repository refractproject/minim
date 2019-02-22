const { expect } = require('../spec-helper');
const { Namespace } = require('../../lib/minim');
const minim = require('../../lib/minim').namespace();
const KeyValuePair = require('../../lib/KeyValuePair');
const JSONSerialiser = require('../../lib/serialisers/JSONSerialiser');

describe('JSON Serialiser', () => {
  let serialiser;

  beforeEach(() => {
    serialiser = new JSONSerialiser(minim);
  });

  describe('initialisation', () => {
    it('uses given namespace', () => {
      expect(serialiser.namespace).to.equal(minim);
    });

    it('creates a default namespace when no namespace is given', () => {
      serialiser = new JSONSerialiser();
      expect(serialiser.namespace).to.be.instanceof(Namespace);
    });
  });

  describe('serialisation', () => {
    describe('#serialiseObject', () => {
      it('can serialise an ObjectElement', () => {
        const object = new minim.elements.Object({ id: 'Example' });
        const result = serialiser.serialiseObject(object);

        expect(result).to.deep.equal({
          id: {
            element: 'string',
            content: 'Example',
          },
        });
      });

      it('can serialise an ObjectElement containg undefined key', () => {
        const object = new minim.elements.Object({ key: undefined });
        const result = serialiser.serialiseObject(object);

        expect(result).to.deep.equal({});
      });
    });

    it('errors when serialising a non-element', () => {
      expect(() => {
        serialiser.serialise('Hello');
      }).to.throw(TypeError, 'Given element `Hello` is not an Element instance');
    });

    it('serialises a primitive element', () => {
      const element = new minim.elements.String('Hello');
      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        content: 'Hello',
      });
    });

    it('serialises an element containing element', () => {
      const string = new minim.elements.String('Hello');
      const element = new minim.Element(string);
      element.element = 'custom';

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'custom',
        content: {
          element: 'string',
          content: 'Hello',
        },
      });
    });

    it('serialises an element containing element array', () => {
      const string = new minim.elements.String('Hello');
      const element = new minim.elements.Array([string]);

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'array',
        content: [
          {
            element: 'string',
            content: 'Hello',
          },
        ],
      });
    });

    it('serialises an element containing an empty array', () => {
      const element = new minim.elements.Array();

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'array',
      });
    });

    it('serialises an element containing a pair', () => {
      const name = new minim.elements.String('name');
      const doe = new minim.elements.String('Doe');
      const element = new minim.elements.Member(name, doe);

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name',
          },
          value: {
            element: 'string',
            content: 'Doe',
          },
        },
      });
    });

    it('serialises an element containing a pair without a value', () => {
      const name = new minim.elements.String('name');
      const element = new minim.elements.Member(name);

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name',
          },
        },
      });
    });

    it('serialises an elements meta', () => {
      const doe = new minim.elements.String('Doe');
      doe.title = 'Name';

      const object = serialiser.serialise(doe);

      expect(object).to.deep.equal({
        element: 'string',
        meta: {
          title: {
            element: 'string',
            content: 'Name',
          },
        },
        content: 'Doe',
      });
    });

    it('serialises an elements attributes', () => {
      const element = new minim.elements.String('Hello World');
      element.attributes.set('thread', 123);

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        attributes: {
          thread: {
            element: 'number',
            content: 123,
          },
        },
        content: 'Hello World',
      });
    });

    it('serialises an element with custom element attributes', () => {
      const element = new minim.elements.String('Hello World');
      element.attributes.set('thread', new minim.Element(123));

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        attributes: {
          thread: {
            element: 'element',
            content: 123,
          },
        },
        content: 'Hello World',
      });
    });
  });

  describe('deserialisation', () => {
    it('errors when deserialising value without element name', () => {
      expect(() => serialiser.deserialise({})).to.throw();
    });

    it('deserialise from a JSON object', () => {
      const element = serialiser.deserialise({
        element: 'string',
        content: 'Hello',
      });

      expect(element).to.be.instanceof(minim.elements.String);
      expect(element.content).to.equal('Hello');
    });

    it('deserialise from a JSON object containing an sub-element', () => {
      const element = serialiser.deserialise({
        element: 'custom',
        content: {
          element: 'string',
          content: 'Hello',
        },
      });

      expect(element).to.be.instanceof(minim.Element);
      expect(element.content).to.be.instanceof(minim.elements.String);
      expect(element.content.content).to.equal('Hello');
    });

    it('deserialise from a JSON object containing an array of elements', () => {
      const element = serialiser.deserialise({
        element: 'array',
        content: [
          {
            element: 'string',
            content: 'Hello',
          },
        ],
      });

      expect(element).to.be.instanceof(minim.elements.Array);
      expect(element.content[0]).to.be.instanceof(minim.elements.String);
      expect(element.content[0].content).to.equal('Hello');
    });

    it('deserialise from a JSON object containing a key-value pair', () => {
      const element = serialiser.deserialise({
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name',
          },
          value: {
            element: 'string',
            content: 'Doe',
          },
        },
      });

      expect(element).to.be.instanceof(minim.elements.Member);
      expect(element.content).to.be.instanceof(KeyValuePair);
      expect(element.key).to.be.instanceof(minim.elements.String);
      expect(element.key.content).to.equal('name');
      expect(element.value).to.be.instanceof(minim.elements.String);
      expect(element.value.content).to.equal('Doe');
    });

    it('deserialise from a JSON object containing a key-value pair without value', () => {
      const element = serialiser.deserialise({
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name',
          },
        },
      });

      expect(element).to.be.instanceof(minim.elements.Member);
      expect(element.content).to.be.instanceof(KeyValuePair);
      expect(element.key).to.be.instanceof(minim.elements.String);
      expect(element.key.content).to.equal('name');
      expect(element.value).to.be.undefined;
    });

    it('deserialise meta', () => {
      const element = serialiser.deserialise({
        element: 'string',
        meta: {
          title: {
            element: 'string',
            content: 'hello',
          },
        },
      });

      expect(element.title).to.be.instanceof(minim.elements.String);
      expect(element.title.content).to.equal('hello');
    });

    it('deserialise attributes', () => {
      const element = serialiser.deserialise({
        element: 'string',
        attributes: {
          thing: {
            element: 'string',
            content: 'hello',
          },
        },
      });

      const attribute = element.attributes.get('thing');
      expect(attribute).to.be.instanceof(minim.elements.String);
      expect(attribute.content).to.equal('hello');
    });

    describe('deserialising base elements', () => {
      it('deserialise string', () => {
        const element = serialiser.deserialise({
          element: 'string',
          content: 'Hello',
        });

        expect(element).to.be.instanceof(minim.elements.String);
        expect(element.content).to.equal('Hello');
      });

      it('deserialise number', () => {
        const element = serialiser.deserialise({
          element: 'number',
          content: 15,
        });

        expect(element).to.be.instanceof(minim.elements.Number);
        expect(element.content).to.equal(15);
      });

      it('deserialise boolean', () => {
        const element = serialiser.deserialise({
          element: 'boolean',
          content: true,
        });

        expect(element).to.be.instanceof(minim.elements.Boolean);
        expect(element.content).to.equal(true);
      });

      it('deserialise null', () => {
        const element = serialiser.deserialise({
          element: 'null',
        });

        expect(element).to.be.instanceof(minim.elements.Null);
      });

      it('deserialise an array', () => {
        const object = serialiser.deserialise({
          element: 'array',
          content: [],
        });

        expect(object).to.be.instanceof(minim.elements.Array);
        expect(object.content).to.deep.equal([]);
      });

      it('deserialise an object', () => {
        const object = serialiser.deserialise({
          element: 'object',
          content: [],
        });

        expect(object).to.be.instanceof(minim.elements.Object);
        expect(object.content).to.deep.equal([]);
      });

      it('deserialise string without content', () => {
        const element = serialiser.deserialise({
          element: 'string',
        });

        expect(element).to.be.instanceof(minim.elements.String);
        expect(element.content).to.be.undefined;
      });

      it('deserialise number without content', () => {
        const element = serialiser.deserialise({
          element: 'number',
        });

        expect(element).to.be.instanceof(minim.elements.Number);
        expect(element.content).to.be.undefined;
      });

      it('deserialise boolean without content', () => {
        const element = serialiser.deserialise({
          element: 'boolean',
        });

        expect(element).to.be.instanceof(minim.elements.Boolean);
        expect(element.content).to.be.undefined;
      });

      it('deserialise an array', () => {
        const object = serialiser.deserialise({
          element: 'array',
        });

        expect(object).to.be.instanceof(minim.elements.Array);
        expect(object.content).to.deep.equal([]);
      });

      it('deserialise an object without content', () => {
        const object = serialiser.deserialise({
          element: 'object',
        });

        expect(object).to.be.instanceof(minim.elements.Object);
        expect(object.content).to.deep.equal([]);
      });
    });
  });
});
