var _ = require('lodash');
var expect = require('../spec-helper').expect;
var Namespace = require('../../lib/minim').Namespace;
var minim = require('../../lib/minim').namespace();
var KeyValuePair = require('../../lib/key-value-pair');
var JSONSerialiser = require('../../lib/serialisers/json');

describe('JSON Serialiser', function() {
  var serialiser;

  beforeEach(function () {
    serialiser = new JSONSerialiser(minim);
  });

  describe('initialisation', function() {
    it('uses given namespace', function() {
      expect(serialiser.namespace).to.equal(minim);
    });

    it('creates a default namespace when no namespace is given', function() {
      serialiser = new JSONSerialiser();
      expect(serialiser.namespace).to.be.instanceof(Namespace);
    });
  });

  describe('serialisation', function() {
    it('errors when serialising a non-element', function() {
      expect(function(){
        serialiser.serialise('Hello');
      }).to.throw(TypeError, 'Given element `Hello` is not an Element instance');
    });

    it('serialises a primitive element', function() {
      var element = new minim.elements.String('Hello')
      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        content: 'Hello'
      });
    });

    it('serialises an element containing element', function() {
      var string = new minim.elements.String('Hello')
      var element = new minim.Element(string);
      element.element = 'custom';

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'custom',
        content: {
          element: 'string',
          content: 'Hello'
        }
      });
    });

    it('serialises an element containing element array', function() {
      var string = new minim.elements.String('Hello')
      var element = new minim.elements.Array([string]);

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'array',
        content: [
          {
            element: 'string',
            content: 'Hello'
          }
        ]
      });
    });

    it('serialises an element containing an empty array', function() {
      var element = new minim.elements.Array();

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'array',
      });
    });


    it('serialise an element with object content', function() {
      var element = new minim.elements.Element({ message: 'hello' });
      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'element',
        content: {
          message: 'hello'
        }
      });
    });

    it('serialises an element containing a pair', function() {
      var name = new minim.elements.String('name')
      var doe = new minim.elements.String('Doe')
      var element = new minim.elements.Member(name, doe);

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name'
          },
          value: {
            element: 'string',
            content: 'Doe'
          },
        }
      });
    });

    it('serialises an element containing a pair without a value', function() {
      var name = new minim.elements.String('name')
      var element = new minim.elements.Member(name);

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name'
          },
        }
      });
    });

    it('serialises an elements meta', function() {
      var doe = new minim.elements.String('Doe')
      doe.title = 'Name';

      var object = serialiser.serialise(doe);

      expect(object).to.deep.equal({
        element: 'string',
        meta: {
          title: {
            element: 'string',
            content: 'Name',
          }
        },
        content: 'Doe'
      });
    });

    it('serialises an elements attributes', function() {
      var element = new minim.elements.String('Hello World')
      element.attributes.set('thread', 123);

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        attributes: {
          thread: {
            element: 'number',
            content: 123
          },
        },
        content: 'Hello World'
      });
    });

    it('serialises an element with custom element attributes', function() {
      var element = new minim.elements.String('Hello World')
      element.attributes.set('thread', new minim.Element(123));

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        attributes: {
          thread: {
            element: 'element',
            content: 123
          }
        },
        content: 'Hello World'
      });
    });
  });

  describe('deserialisation', function() {
    it('errors when deserialising value without element name', function() {
      expect(function() { return serialiser.deserialise({}); }).to.throw();
    });

    it('deserialise from a JSON object', function() {
      var element = serialiser.deserialise({
        element: 'string',
        content: 'Hello'
      });

      expect(element).to.be.instanceof(minim.elements.String);
      expect(element.content).to.equal('Hello');
    });

    it('deserialise from a JSON object containing an sub-element', function() {
      var element = serialiser.deserialise({
        element: 'custom',
        content: {
          element: 'string',
          content: 'Hello',
        }
      });

      expect(element).to.be.instanceof(minim.Element);
      expect(element.content).to.be.instanceof(minim.elements.String);
      expect(element.content.content).to.equal('Hello');
    });

    it('deserialise from a JSON object containing an array of elements', function() {
      var element = serialiser.deserialise({
        element: 'array',
        content: [
          {
            element: 'string',
            content: 'Hello',
          }
        ]
      });

      expect(element).to.be.instanceof(minim.elements.Array);
      expect(element.content[0]).to.be.instanceof(minim.elements.String);
      expect(element.content[0].content).to.equal('Hello');
    });

    it('deserialise from a JSON object containing a key-value pair', function() {
      var element = serialiser.deserialise({
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name',
          },
          value: {
            element: 'string',
            content: 'Doe'
          }
        }
      });

      expect(element).to.be.instanceof(minim.elements.Member);
      expect(element.content).to.be.instanceof(KeyValuePair);
      expect(element.key).to.be.instanceof(minim.elements.String);
      expect(element.key.content).to.equal('name');
      expect(element.value).to.be.instanceof(minim.elements.String);
      expect(element.value.content).to.equal('Doe');
    });

    it('deserialise from a JSON object containing a key-value pair without value', function() {
      var element = serialiser.deserialise({
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name',
          }
        }
      });

      expect(element).to.be.instanceof(minim.elements.Member);
      expect(element.content).to.be.instanceof(KeyValuePair);
      expect(element.key).to.be.instanceof(minim.elements.String);
      expect(element.key.content).to.equal('name');
      expect(element.value).to.be.undefined;
    });

    it('deserialise meta', function() {
      var element = serialiser.deserialise({
        element: 'string',
        meta: {
          title: {
            element: 'string',
            content: 'hello',
          }
        }
      });

      expect(element.title).to.be.instanceof(minim.elements.String);
      expect(element.title.content).to.equal('hello');
    });

    it('deserialise attributes', function() {
      var element = serialiser.deserialise({
        element: 'string',
        attributes: {
          thing: {
            element: 'string',
            content: 'hello'
          }
        }
      });

      const attribute = element.attributes.get('thing');
      expect(attribute).to.be.instanceof(minim.elements.String);
      expect(attribute.content).to.equal('hello');
    });

    describe('deserialising base elements', function() {
      it('deserialise string', function() {
        var element = serialiser.deserialise({
          element: 'string',
          content: 'Hello',
        });

        expect(element).to.be.instanceof(minim.elements.String);
        expect(element.content).to.equal('Hello');
      });

      it('deserialise number', function() {
        var element = serialiser.deserialise({
          element: 'number',
          content: 15,
        });

        expect(element).to.be.instanceof(minim.elements.Number);
        expect(element.content).to.equal(15);
      });

      it('deserialise boolean', function() {
        var element = serialiser.deserialise({
          element: 'boolean',
          content: true
        });

        expect(element).to.be.instanceof(minim.elements.Boolean);
        expect(element.content).to.equal(true);
      });

      it('deserialise null', function() {
        var element = serialiser.deserialise({
          element: 'null',
        });

        expect(element).to.be.instanceof(minim.elements.Null);
      });

      it('deserialise an array', function() {
        var object = serialiser.deserialise({
          element: 'array',
          content: [],
        });

        expect(object).to.be.instanceof(minim.elements.Array);
        expect(object.content).to.deep.equal([]);
      });

      it('deserialise an object', function() {
        var object = serialiser.deserialise({
          element: 'object',
          content: [],
        });

        expect(object).to.be.instanceof(minim.elements.Object);
        expect(object.content).to.deep.equal([]);
      });

      it('deserialise string without content', function() {
        var element = serialiser.deserialise({
          element: 'string',
        });

        expect(element).to.be.instanceof(minim.elements.String);
        expect(element.content).to.be.undefined;
      });

      it('deserialise number without content', function() {
        var element = serialiser.deserialise({
          element: 'number',
        });

        expect(element).to.be.instanceof(minim.elements.Number);
        expect(element.content).to.be.undefined;
      });

      it('deserialise boolean without content', function() {
        var element = serialiser.deserialise({
          element: 'boolean',
        });

        expect(element).to.be.instanceof(minim.elements.Boolean);
        expect(element.content).to.be.undefined;
      });

      it('deserialise an array', function() {
        var object = serialiser.deserialise({
          element: 'array',
        });

        expect(object).to.be.instanceof(minim.elements.Array);
        expect(object.content).to.deep.equal([]);
      });

      it('deserialise an object without content', function() {
        var object = serialiser.deserialise({
          element: 'object',
        });

        expect(object).to.be.instanceof(minim.elements.Object);
        expect(object.content).to.deep.equal([]);
      });
    });
  });
});
