const { expect } = require('../spec-helper');
const { Namespace } = require('../../src/minim');
const minim = require('../../src/minim').namespace();
const KeyValuePair = require('../../src/key-value-pair');
const JSONSerialiser = require('../../src/serialisers/json-0.6');

describe('JSON 0.6 Serialiser', function () {
  let serialiser;

  beforeEach(function () {
    serialiser = new JSONSerialiser(minim);
  });

  describe('initialisation', function () {
    it('uses given namespace', function () {
      expect(serialiser.namespace).to.equal(minim);
    });

    it('creates a default namespace when no namespace is given', function () {
      serialiser = new JSONSerialiser();
      expect(serialiser.namespace).to.be.instanceof(Namespace);
    });
  });

  describe('serialisation', function () {
    describe('#serialiseObject', function () {
      it('can serialise an ObjectElement', function () {
        const object = new minim.elements.Object({ id: 'Example' });
        const result = serialiser.serialiseObject(object);

        expect(result).to.deep.equal({
          id: 'Example',
        });
      });

      it('can serialise an ObjectElement containg undefined key', function () {
        const object = new minim.elements.Object({ key: undefined });
        const result = serialiser.serialiseObject(object);

        expect(result).to.deep.equal({});
      });
    });

    it('errors when serialising a non-element', function () {
      expect(function () {
        serialiser.serialise('Hello');
      }).to.throw(TypeError, 'Given element `Hello` is not an Element instance');
    });

    it('serialises a primitive element', function () {
      const element = new minim.elements.String('Hello');
      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        content: 'Hello',
      });
    });

    it('serialises an element containing element', function () {
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

    it('serialises an element containing element array', function () {
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

    it('serialises an element containing an empty array', function () {
      const element = new minim.elements.Array();

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'array',
      });
    });

    it('serialise an element with object content', function () {
      const element = new minim.Element({ message: 'hello' });
      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'element',
        content: [
          {
            element: 'member',
            content: {
              key: {
                element: 'string',
                content: 'message',
              },
              value: {
                element: 'string',
                content: 'hello',
              },
            },
          },
        ],
      });
    });

    it('serialises an element containing a pair', function () {
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

    it('serialises an element containing a pair without a value', function () {
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

    it('serialises an elements meta', function () {
      const doe = new minim.elements.String('Doe');
      doe.title = 'Name';

      const object = serialiser.serialise(doe);

      expect(object).to.deep.equal({
        element: 'string',
        meta: {
          title: 'Name',
        },
        content: 'Doe',
      });
    });

    it('serialises an elements attributes', function () {
      const element = new minim.elements.String('Hello World');
      element.attributes.set('thread', 123);

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        attributes: {
          thread: 123,
        },
        content: 'Hello World',
      });
    });

    it('serialises an element with custom element attributes', function () {
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

    it('serialises enum', function () {
      const defaultElement = new minim.Element(new minim.elements.String('North'));
      defaultElement.element = 'enum';

      const sampleNorth = new minim.Element(new minim.elements.String('North'));
      sampleNorth.element = 'enum';
      const sampleEast = new minim.Element(new minim.elements.String('East'));
      sampleEast.element = 'enum';
      const samples = new minim.elements.Array([
        sampleNorth,
        sampleEast,
      ]);

      const enumeration = new minim.Element(new minim.elements.String('South'));
      enumeration.element = 'enum';
      enumeration.attributes.set('default', defaultElement);
      enumeration.attributes.set('enumerations', ['North', 'East', 'South', 'West']);
      enumeration.attributes.set('samples', samples);

      const object = serialiser.serialise(enumeration);

      expect(object).to.deep.equal({
        element: 'enum',
        attributes: {
          default: [
            {
              element: 'string',
              content: 'North',
            },
          ],
          samples: [
            [
              {
                element: 'string',
                content: 'South',
              },
            ],
            [
              {
                element: 'string',
                content: 'North',
              },
            ],
            [
              {
                element: 'string',
                content: 'East',
              },
            ],
          ],
        },
        content: [
          {
            element: 'string',
            content: 'North',
          },
          {
            element: 'string',
            content: 'East',
          },
          {
            element: 'string',
            content: 'South',
          },
          {
            element: 'string',
            content: 'West',
          },
        ],
      });

      // Refract 1.0 serialisation
      // {
      //   element: 'enum',
      //   attributes: {
      //     default: {
      //       element: 'enum',
      //       content: {
      //         element: 'string',
      //         content: 'North'
      //       }
      //     },
      //     enumerations: {
      //       element: 'array',
      //       content: [
      //         {
      //           element: 'string',
      //           content: 'North'
      //         },
      //         {
      //           element: 'string',
      //           content: 'East'
      //         },
      //         {
      //           element: 'string',
      //           content: 'South'
      //         },
      //         {
      //           element: 'string',
      //           content: 'West'
      //         }
      //       ]
      //     },
      //     samples: {
      //       element: 'array',
      //       content: [
      //         {
      //           element: 'enum',
      //           content: {
      //             element: 'string',
      //             content: 'North'
      //           }
      //         },
      //         {
      //           element: 'enum',
      //           content: {
      //             element: 'string',
      //             content: 'East'
      //           }
      //         }
      //       ]
      //     }
      //   },
      //   content: {
      //     element: 'string',
      //     content: 'South'
      //   }
      // }
    });

    it('serialises enum with fixed values', function () {
      const defaultElement = new minim.Element(new minim.elements.String('North'));
      defaultElement.element = 'enum';
      defaultElement.content.attributes.set('typeAttributes', ['fixed']);

      const sampleNorth = new minim.Element(new minim.elements.String('North'));
      sampleNorth.element = 'enum';
      const sampleEast = new minim.Element(new minim.elements.String('East'));
      sampleEast.element = 'enum';
      const samples = new minim.elements.Array([
        sampleNorth,
        sampleEast,
      ]);

      sampleNorth.content.attributes.set('typeAttributes', ['fixed']);
      sampleEast.content.attributes.set('typeAttributes', ['fixed']);

      const enumeration = new minim.Element(new minim.elements.String('South'));
      enumeration.element = 'enum';
      enumeration.attributes.set('default', defaultElement);
      enumeration.attributes.set('enumerations', ['North', 'East', 'South', 'West']);
      enumeration.attributes.set('samples', samples);

      const enumerations = enumeration.attributes.get('enumerations');
      enumerations.get(0).attributes.set('typeAttributes', ['fixed']);
      enumerations.get(1).attributes.set('typeAttributes', ['fixed']);
      enumerations.get(2).attributes.set('typeAttributes', ['fixed']);
      enumerations.get(3).attributes.set('typeAttributes', ['fixed']);

      const object = serialiser.serialise(enumeration);

      expect(object).to.deep.equal({
        element: 'enum',
        attributes: {
          default: [
            {
              element: 'string',
              content: 'North',
            },
          ],
          samples: [
            [
              {
                element: 'string',
                content: 'South',
              },
            ],
            [
              {
                element: 'string',
                content: 'North',
              },
            ],
            [
              {
                element: 'string',
                content: 'East',
              },
            ],
          ],
        },
        content: [
          {
            element: 'string',
            content: 'North',
          },
          {
            element: 'string',
            content: 'East',
          },
          {
            element: 'string',
            content: 'South',
          },
          {
            element: 'string',
            content: 'West',
          },
        ],
      });
    });

    it('serialises samples attributes as element', function () {
      const sample = new minim.elements.Object({ name: 'Doe' });

      const element = new minim.elements.Object();
      element.attributes.set('samples', [sample]);
      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'object',
        attributes: {
          samples: [
            [
              {
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
              },
            ],
          ],
        },
      });
    });

    it('serialises default attributes as element', function () {
      const defaultElement = new minim.elements.Object({ name: 'Doe' });

      const element = new minim.elements.Object();
      element.attributes.set('default', defaultElement);
      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'object',
        attributes: {
          default: [
            {
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
            },
          ],
        },
      });
    });

    it('serialises enum with fixed content', function () {
      const enumeration = new minim.Element(new minim.elements.String('South'));
      enumeration.element = 'enum';
      enumeration.content.attributes.set('typeAttributes', ['fixed']);

      const object = serialiser.serialise(enumeration);

      expect(object).to.deep.equal({
        element: 'enum',
        content: [
          {
            element: 'string',
            content: 'South',
          },
        ],
      });
    });

    it('serialises enum without content, samples & default', function () {
      const enumeration = new minim.Element();
      enumeration.element = 'enum';
      enumeration.attributes.set('enumerations', ['North', 'East', 'South', 'West']);

      const object = serialiser.serialise(enumeration);

      expect(object).to.deep.equal({
        element: 'enum',
        content: [
          {
            element: 'string',
            content: 'North',
          },
          {
            element: 'string',
            content: 'East',
          },
          {
            element: 'string',
            content: 'South',
          },
          {
            element: 'string',
            content: 'West',
          },
        ],
      });

      // Refract 1.0 serialisation
      // {
      //   element: 'enum',
      //   attributes: {
      //     enumerations: {
      //       element: 'array',
      //       content: [
      //         {
      //           element: 'string',
      //           content: 'North'
      //         },
      //         {
      //           element: 'string',
      //           content: 'East'
      //         },
      //         {
      //           element: 'string',
      //           content: 'South'
      //         },
      //         {
      //           element: 'string',
      //           content: 'West'
      //         }
      //       ]
      //     }
      //   },
      //   content: null
      // }
    });

    it('serialises enum inside array inside attributes as array', function () {
      const element = new minim.elements.String('Hello World');
      const enumeration = new minim.Element(new minim.elements.String('North'));
      enumeration.element = 'enum';
      element.attributes.set('directions', enumeration);

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        attributes: {
          directions: [
            {
              element: 'string',
              content: 'North',
            },
          ],
        },
        content: 'Hello World',
      });

      // Refract 1.0 serialisation
      // {
      //   element: 'string',
      //   attributes: {
      //     directions: {
      //       element: 'enum',
      //       content: {
      //         element: 'string',
      //         content: 'North'
      //       }
      //     }
      //   },
      //   content: 'Hello World'
      // }
    });

    it('serialises enumerations even when element name is not `enum`', function () {
      const enumeration = new minim.Element();
      enumeration.element = 'B';
      enumeration.attributes.set('enumerations', ['North']);

      const object = serialiser.serialise(enumeration);

      expect(object).to.deep.equal({
        element: 'B',
        content: [
          {
            element: 'string',
            content: 'North',
          },
        ],
      });

      // Refract 1.0 serialisation
      // {
      //   element: 'B',
      //   attributes: {
      //     enumerations: {
      //       element: 'array',
      //       content: [
      //         {
      //           element: 'string',
      //           content: 'North'
      //         }
      //       ]
      //     }
      //   },
      //   content: null
      // }
    });

    it('always serialises items inside `default` attribute', function () {
      const element = new minim.elements.String('Hello World');
      element.attributes.set('default', new minim.elements.String('North'));

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        attributes: {
          default: 'North',
        },
        content: 'Hello World',
      });

      // Refract 1.0 serialisation
      // {
      //   element: 'string',
      //   attributes: {
      //     default: {
      //       element: 'string',
      //       content: 'North'
      //     }
      //   },
      //   content: 'Hello World'
      // }
    });

    it('always serialises items inside `default` attribute array', function () {
      const element = new minim.elements.Array(['Hello World']);
      const values = new minim.elements.Array([new minim.elements.String('North')]);
      element.attributes.set('default', values);

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'array',
        attributes: {
          default: [
            {
              element: 'string',
              content: 'North',
            },
          ],
        },
        content: [
          {
            element: 'string',
            content: 'Hello World',
          },
        ],
      });

      // Refract 1.0 serialisation
      // {
      //   element: 'array',
      //   attributes: {
      //     default: {
      //       element: 'array',
      //       content: [
      //         {
      //           element: 'string',
      //           content: 'North'
      //         }
      //       ]
      //     }
      //   },
      //   content: [
      //     {
      //       element: 'string',
      //       content: 'Hello World'
      //     }
      //   ]
      // }
    });

    it('serialises a ref element', function () {
      const element = new minim.elements.Ref('content');

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'ref',
        content: {
          path: 'element',
          href: 'content',
        },
      });

      // Refract 1.0 serialisation
      // {
      //   element: 'ref',
      //   attributes: {
      //     path: {
      //       element: 'string',
      //       content: 'element'
      //     }
      //   },
      //   content: 'content'
      // }
    });

    it('serialises a sourceMap element as values', function () {
      const element = new minim.elements.Element(
        new minim.elements.Array(
          [new minim.elements.Array([1, 2])]
        )
      );
      element.element = 'sourceMap';

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'sourceMap',
        content: [[1, 2]],
      });

      // Refract 1.0 serialisation
      // {
      //   element: 'sourceMap',
      //   content: {
      //     element: 'array',
      //     content: [
      //       {
      //         element: 'array',
      //         content: [
      //           {
      //             element: 'number',
      //             content: 1
      //           },
      //           {
      //             element: 'number',
      //             content: 2
      //           }
      //         ]
      //       }
      //     ]
      //   }
      // }
    });

    it('serialises a dataStructure element inside an array', function () {
      const element = new minim.elements.Element(
        new minim.elements.String('Hello')
      );
      element.element = 'dataStructure';

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'dataStructure',
        content: [
          {
            element: 'string',
            content: 'Hello',
          },
        ],
      });

      // Refract 1.0 serialisation
      // {
      //   element: 'dataStructure',
      //   content: {
      //     element: 'string',
      //     content: 'Hello'
      //   }
      // }
    });

    it('serialises a element attribute called meta as metadata', function () {
      const element = new minim.elements.Null();
      element.attributes.set('metadata', 'example');

      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'null',
        attributes: {
          meta: 'example',
        },
        content: null,
      });
    });

    it('serialises a variable member', function () {
      const element = new minim.elements.Member('self', 'https://example.com');
      element.attributes.set('variable', true);
      const object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'member',
        content: {
          key: {
            element: 'string',
            attributes: {
              variable: true,
            },
            content: 'self',
          },
          value: {
            element: 'string',
            content: 'https://example.com',
          },
        },
      });
    });

    it('serialises empty parseResult content', function () {
      const element = new minim.elements.Element([]);
      element.element = 'parseResult';
      const serialised = serialiser.serialise(element);

      expect(serialised).to.deep.equal({
        element: 'parseResult',
        content: [],
      });
    });

    it('serialises empty httpRequest content', function () {
      const element = new minim.elements.Element([]);
      element.element = 'httpRequest';
      const serialised = serialiser.serialise(element);

      expect(serialised).to.deep.equal({
        element: 'httpRequest',
        content: [],
      });
    });

    it('serialises empty httpResponse content', function () {
      const element = new minim.elements.Element([]);
      element.element = 'httpResponse';
      const serialised = serialiser.serialise(element);

      expect(serialised).to.deep.equal({
        element: 'httpResponse',
        content: [],
      });
    });

    it('serialises empty link content', function () {
      const element = new minim.elements.Element([]);
      element.element = 'link';
      const serialised = serialiser.serialise(element);

      expect(serialised).to.deep.equal({
        element: 'link',
        content: [],
      });
    });

    it('serialises empty category content', function () {
      const element = new minim.elements.Element([]);
      element.element = 'category';
      const serialised = serialiser.serialise(element);

      expect(serialised).to.deep.equal({
        element: 'category',
        content: [],
      });
    });
  });

  describe('deserialisation', function () {
    it('deserialise from a JSON object', function () {
      const element = serialiser.deserialise({
        element: 'string',
        content: 'Hello',
      });

      expect(element).to.be.instanceof(minim.elements.String);
      expect(element.content).to.equal('Hello');
    });

    it('deserialise from a JSON object containing an sub-element', function () {
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

    it('deserialise from a JSON object containing an array of elements', function () {
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

    it('deserialises from a JSON object containing JSON object content', function () {
      const element = serialiser.deserialise({
        element: 'object',
        content: {
          message: 'hello',
        },
      });

      expect(element).to.be.instanceof(minim.elements.Element);
      expect(element.toValue()).to.deep.equal({ message: 'hello' });
    });

    it('deserialise from a JSON object containing a key-value pair', function () {
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

    it('deserialise from a JSON object containing a key-value pair without value', function () {
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

    it('deserialise meta', function () {
      const element = serialiser.deserialise({
        element: 'string',
        meta: {
          title: 'hello',
        },
      });

      expect(element.title).to.be.instanceof(minim.elements.String);
      expect(element.title.content).to.equal('hello');
    });

    it('deserialise refracted meta', function () {
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


    it('deserialise attributes', function () {
      const element = serialiser.deserialise({
        element: 'string',
        attributes: {
          thing: 'hello',
        },
      });

      const attribute = element.attributes.get('thing');
      expect(attribute).to.be.instanceof(minim.elements.String);
      expect(attribute.content).to.equal('hello');
    });

    it('deserialise refracted attributes', function () {
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

    it('deserialises an array element from JS array', function () {
      const element = serialiser.deserialise([1]);

      expect(element).to.be.instanceof(minim.elements.Array);
      expect(element.get(0)).to.be.instanceof(minim.elements.Number);
    });

    context('enum element', function () {
      it('deserialises content', function () {
        const element = serialiser.deserialise({
          element: 'enum',
          content: [
            {
              element: 'number',
              content: 3,
            },
            {
              element: 'number',
              content: 4,
            },
          ],
        });

        expect(element.element).to.equal('enum');
        expect(element.attributes.get('enumerations').toValue()).to.deep.equal([
          3,
          4,
        ]);
        expect(element.content).to.be.undefined;
      });

      it('deserialises with sample', function () {
        const element = serialiser.deserialise({
          element: 'enum',
          attributes: {
            samples: [
              [
                {
                  element: 'number',
                  content: 3,
                },
              ],
            ],
          },
        });

        expect(element.element).to.equal('enum');
        expect(element.attributes.get('samples').toValue()).to.deep.equal([]);
        expect(element.toValue()).to.equal(3);
      });

      it('deserialises with samples', function () {
        const element = serialiser.deserialise({
          element: 'enum',
          attributes: {
            samples: [
              [
                {
                  element: 'number',
                  content: 3,
                },
                {
                  element: 'number',
                  content: 4,
                },
              ],
              [
                {
                  element: 'number',
                  content: 5,
                },
                {
                  element: 'number',
                  content: 6,
                },
              ],
            ],
          },
        });

        expect(element.element).to.equal('enum');
        expect(element.toValue()).to.equal(3);

        const samples = element.attributes.get('samples');
        expect(samples).to.be.instanceof(minim.elements.Array);

        expect(samples.get(0).element).to.equal('enum');
        expect(samples.get(0).content).to.be.instanceof(minim.elements.Number);

        expect(samples.get(1).element).to.equal('enum');
        expect(samples.get(1).content).to.be.instanceof(minim.elements.Number);

        expect(samples.get(2).element).to.equal('enum');
        expect(samples.get(2).content).to.be.instanceof(minim.elements.Number);

        expect(samples.toValue()).to.deep.equal([
          4,
          5,
          6,
        ]);
      });

      it('deserialises with default', function () {
        const element = serialiser.deserialise({
          element: 'enum',
          attributes: {
            default: [
              {
                element: 'number',
                content: 3,
              },
            ],
          },
        });

        const defaultElement = element.attributes.get('default');

        expect(element.element).to.equal('enum');
        expect(defaultElement.element).to.equal('enum');
        expect(defaultElement.content).to.be.instanceof(minim.elements.Number);
        expect(defaultElement.toValue()).to.equal(3);
        expect(element.content).to.be.undefined;
      });

      it('deserialises with samples, enumerations and default ', function () {
        const element = serialiser.deserialise({
          element: 'enum',
          attributes: {
            samples: [
              [
                {
                  element: 'number',
                  content: 3,
                },
                {
                  element: 'number',
                  content: 4,
                },
              ],
              [
                {
                  element: 'number',
                  content: 5,
                },
                {
                  element: 'number',
                  content: 6,
                },
              ],
            ],
            default: [
              {
                element: 'number',
                content: 1337,
              },
            ],
          },
          content: [
            {
              element: 'number',
              content: 3,
            },
            {
              element: 'number',
              content: 6,
            },
          ],
        });

        expect(element.element).to.equal('enum');
        expect(element.toValue()).to.equal(3);

        const samples = element.attributes.get('samples');
        expect(samples).to.be.instanceof(minim.elements.Array);

        expect(samples.get(0).element).to.equal('enum');
        expect(samples.get(0).content).to.be.instanceof(minim.elements.Number);

        expect(samples.get(1).element).to.equal('enum');
        expect(samples.get(1).content).to.be.instanceof(minim.elements.Number);

        expect(samples.get(2).element).to.equal('enum');
        expect(samples.get(2).content).to.be.instanceof(minim.elements.Number);

        expect(samples.toValue()).to.deep.equal([
          4,
          5,
          6,
        ]);

        const defaultElement = element.attributes.get('default');
        expect(defaultElement.element).to.equal('enum');
        expect(defaultElement.content).to.be.instanceof(minim.elements.Number);
        expect(defaultElement.toValue()).to.equal(1337);

        const enumerations = element.attributes.get('enumerations');
        expect(enumerations).to.be.instanceof(minim.elements.Array);

        expect(enumerations.get(0)).to.be.instanceof(minim.elements.Number);
        expect(enumerations.get(1)).to.be.instanceof(minim.elements.Number);

        expect(enumerations.toValue()).to.deep.equal([3, 6]);
      });
    });

    it('deserialises data structure inside an array', function () {
      const dataStructure = serialiser.deserialise({
        element: 'dataStructure',
        content: [
          {
            element: 'string',
          },
        ],
      });

      expect(dataStructure.content).to.be.instanceof(minim.elements.String);
    });

    it('deserialises category with meta attribute', function () {
      const category = serialiser.deserialise({
        element: 'category',
        attributes: {
          meta: [
            {
              element: 'member',
              meta: {
                classes: ['user'],
              },
              content: {
                key: 'HOST',
                value: 'https://example.com',
              },
            },
          ],
        },
        content: [],
      });

      const metadata = category.attributes.get('metadata');
      expect(metadata).to.be.instanceof(minim.elements.Array);

      const member = metadata.get(0);
      expect(member).to.be.instanceof(minim.elements.Member);
      expect(member.classes.toValue()).to.deep.equal(['user']);
      expect(member.key.toValue()).to.equal('HOST');
      expect(member.value.toValue()).to.equal('https://example.com');
    });

    it('deserialises a variable member', function () {
      const member = serialiser.deserialise({
        element: 'member',
        content: {
          key: {
            element: 'self',
            attributes: {
              variable: true,
            },
            content: 'https://example.com',
          },
          value: {
            element: 'string',
            content: 'https://example.com',
          },
        },
      });

      expect(member).to.be.instanceof(minim.elements.Member);
      expect(member.attributes.getValue('variable')).to.be.true;
      expect(member.key.attributes.get('variable')).to.be.undefined;
    });

    describe('deserialising base elements', function () {
      it('deserialise string', function () {
        const element = serialiser.deserialise({
          element: 'string',
          content: 'Hello',
        });

        expect(element).to.be.instanceof(minim.elements.String);
        expect(element.content).to.equal('Hello');
      });

      it('deserialise number', function () {
        const element = serialiser.deserialise({
          element: 'number',
          content: 15,
        });

        expect(element).to.be.instanceof(minim.elements.Number);
        expect(element.content).to.equal(15);
      });

      it('deserialise boolean', function () {
        const element = serialiser.deserialise({
          element: 'boolean',
          content: true,
        });

        expect(element).to.be.instanceof(minim.elements.Boolean);
        expect(element.content).to.equal(true);
      });

      it('deserialise null', function () {
        const element = serialiser.deserialise({
          element: 'null',
        });

        expect(element).to.be.instanceof(minim.elements.Null);
      });

      it('deserialise an array', function () {
        const object = serialiser.deserialise({
          element: 'array',
          content: [],
        });

        expect(object).to.be.instanceof(minim.elements.Array);
        expect(object.content).to.deep.equal([]);
      });

      it('deserialise an object', function () {
        const object = serialiser.deserialise({
          element: 'object',
          content: [],
        });

        expect(object).to.be.instanceof(minim.elements.Object);
        expect(object.content).to.deep.equal([]);
      });

      it('deserialise string without content', function () {
        const element = serialiser.deserialise({
          element: 'string',
        });

        expect(element).to.be.instanceof(minim.elements.String);
        expect(element.content).to.be.undefined;
      });

      it('deserialise number without content', function () {
        const element = serialiser.deserialise({
          element: 'number',
        });

        expect(element).to.be.instanceof(minim.elements.Number);
        expect(element.content).to.be.undefined;
      });

      it('deserialise boolean without content', function () {
        const element = serialiser.deserialise({
          element: 'boolean',
        });

        expect(element).to.be.instanceof(minim.elements.Boolean);
        expect(element.content).to.be.undefined;
      });

      it('deserialise an array', function () {
        const object = serialiser.deserialise({
          element: 'array',
        });

        expect(object).to.be.instanceof(minim.elements.Array);
        expect(object.content).to.deep.equal([]);
      });

      it('deserialise an object without content', function () {
        const object = serialiser.deserialise({
          element: 'object',
        });

        expect(object).to.be.instanceof(minim.elements.Object);
        expect(object.content).to.deep.equal([]);
      });
    });
  });
});
