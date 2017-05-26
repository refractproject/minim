var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();
var KeyValuePair = require('../../lib/primitives/key-value-pair');
var JSONSerialiser = require('../../lib/serialisers/json');

describe('JSON Serialiser', function() {
  var serialiser = new JSONSerialiser(minim);

  describe('serialisation', function() {
    it('serialises a primitive element', function() {
      var element = new minim.elements.String('Hello')
      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        meta: {},
        attributes: {},
        content: 'Hello'
      });
    });

    it('serialises an element containing element', function() {
      var string = new minim.elements.String('Hello')
      var element = new minim.BaseElement(string);
      element.element = 'custom';

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'custom',
        meta: {},
        attributes: {},
        content: {
          element: 'string',
          meta: {},
          attributes: {},
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
        meta: {},
        attributes: {},
        content: [
          {
            element: 'string',
            meta: {},
            attributes: {},
            content: 'Hello'
          }
        ]
      });
    });

    it('serialises an element containing a pair', function() {
      var name = new minim.elements.String('name')
      var doe = new minim.elements.String('Doe')
      var element = new minim.elements.Member(name, doe);

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'member',
        meta: {},
        attributes: {},
        content: {
          key: {
            element: 'string',
            meta: {},
            attributes: {},
            content: 'name'
          },
          value: {
            element: 'string',
            meta: {},
            attributes: {},
            content: 'Doe'
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
          title: 'Name'
        },
        attributes: {},
        content: 'Doe'
      });
    });

    it('serialises an elements attributes', function() {
      var element = new minim.elements.String('Hello World')
      element.attributes.set('thread', 123);

      var object = serialiser.serialise(element);

      expect(object).to.deep.equal({
        element: 'string',
        meta: {},
        attributes: {
          thread: 123
        },
        content: 'Hello World'
      });
    });
  });

  describe('deserialisation', function() {
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

      expect(element).to.be.instanceof(minim.BaseElement);
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

    it('deserialise meta', function() {
      var element = serialiser.deserialise({
        element: 'string',
        meta: {
          title: 'hello'
        }
      });

      expect(element.title).to.be.instanceof(minim.elements.String);
      expect(element.title.content).to.equal('hello');
    });

    it('deserialise refracted meta', function() {
      var element = serialiser.deserialise({
        element: 'string',
        meta: {
          title: {
            element: 'string',
            content: 'hello'
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
          thing: 'hello'
        }
      });

      const attribute = element.attributes.get('thing');
      expect(attribute).to.be.instanceof(minim.elements.String);
      expect(attribute.content).to.equal('hello');
    });

    it('deserialise refracted attributes', function() {
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

    it('deserialise string', function() {
      var element = serialiser.deserialise('Hello');

      expect(element).to.be.instanceof(minim.elements.String);
      expect(element.content).to.equal('Hello');
    });

    it('deserialise number', function() {
      var element = serialiser.deserialise(15);

      expect(element).to.be.instanceof(minim.elements.Number);
      expect(element.content).to.equal(15);
    });

    it('deserialise boolean', function() {
      var element = serialiser.deserialise(true);

      expect(element).to.be.instanceof(minim.elements.Boolean);
      expect(element.content).to.equal(true);
    });

    it('deserialise null', function() {
      var element = serialiser.deserialise(null);

      expect(element).to.be.instanceof(minim.elements.Null);
    });
  });
});
