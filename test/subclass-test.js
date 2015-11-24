var _ = require('lodash');
var expect = require('./spec-helper').expect;
var minim = require('../lib/minim').namespace();

var ArrayElement = minim.getElementClass('array');
var StringElement = minim.getElementClass('string');

describe('Minim subclasses', function() {
  // TODO: Provide better interface for extending elements
  var MyElement = function() {
    StringElement.apply(this, arguments);
    this.element = 'myElement';
    this._attributeElementKeys = ['headers'];
    this._attributeElementArrayKeys = ['sourceMap'];
  }

  MyElement.prototype = _.create(StringElement.prototype, {
    ownMethod: function() {
      return 'It works!';
    }
  });

  it('can extend the base element with its own method', function() {
    var myElement = new MyElement();
    expect(myElement.ownMethod()).to.equal('It works!');
  });

  context('when initializing', function() {
    var myElement = new MyElement();

    it('can overwrite the element name', function() {
      expect(myElement.element).to.equal('myElement');
    });

    it('returns the correct primitive element', function() {
      expect(myElement.primitive()).to.equal('string');
    });
  });

  describe('deserializing attributes', function() {
    var myElement = new MyElement().fromRefract({
      element: 'myElement',
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
        foo: 'bar',
        sourceMap: [
          {
            element: 'string',
            content: 'test'
          }
        ]
      }
    });

    it('should create headers element instance', function() {
      expect(myElement.attributes.get('headers')).to.be.instanceof(ArrayElement);
    });

    it('should leave foo alone', function() {
      expect(myElement.attributes.get('foo').toValue()).to.be.a('string');
    });

    it('should create array of source map elements', function() {
      var sourceMaps = myElement.attributes.get('sourceMap');
      expect(sourceMaps).to.have.length(1);
      expect(sourceMaps.first()).to.be.instanceOf(StringElement);
      expect(sourceMaps.first().toValue()).to.equal('test');
    });
  });

  describe('serializing attributes', function() {
    var myElement = new MyElement();

    myElement.attributes.set('headers', new ArrayElement(['application/json']));
    myElement.attributes.get('headers').content[0].meta.set('name', 'Content-Type');

    myElement.attributes.set('sourceMap', ['string1', 'string2']);

    it('should serialize headers element', function() {
      var refracted = myElement.toCompactRefract();

      expect(refracted).to.deep.equal(['myElement', {}, {
        headers: ['array', {}, {}, [
            ['string', {name: 'Content-Type'}, {}, 'application/json']
        ]],
        sourceMap: [
          ['string', {}, {}, 'string1'],
          ['string', {}, {}, 'string2']
        ]
      }, null]);
    });

    it('should round-trip', function() {
      const refracted = myElement.toCompactRefract();
      expect(myElement.fromCompactRefract(refracted).toCompactRefract()).to.deep.equal(refracted);
    });
  });
});
