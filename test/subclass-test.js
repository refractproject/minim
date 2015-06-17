var _ = require('lodash');
var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');

describe('Minim subclasses', function() {
  // TODO: Provide better interface for extending elements
  var MyElement = function() {
    minim.StringElement.apply(this, arguments);
    this.element = 'myElement';
    this._attributeElementKeys = ['headers'];
  }

  MyElement.prototype = _.create(minim.StringElement.prototype, {
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
        foo: 'bar'
      }
    });

    it('should create headers element instance', function() {
      expect(myElement.attributes.headers).to.be.instanceof(minim.ArrayElement);
    });

    it('should leave foo alone', function() {
      expect(myElement.attributes.foo).to.be.a('string');
    });
  });

  describe('serializing attributes', function() {
    var myElement = new MyElement();
    myElement.attributes.headers = new minim.ArrayElement(['application/json']);
    myElement.attributes.headers.content[0].meta.name = 'Content-Type';

    it('should serialize headers element', function() {
      var refracted = myElement.toCompactRefract();

      expect(refracted).to.deep.equal(['myElement', {}, {
        headers: ['array', {}, {}, [
            ['string', {name: 'Content-Type'}, {}, 'application/json']
        ]]
      }, null]);
    });
  });
});