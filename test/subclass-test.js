var _ = require('lodash');
var expect = require('./spec-helper').expect;
var minim = require('../lib/minim').init();

describe('Minim subclasses', function() {
  var MyElement;

  before(function() {
    MyElement = minim.StringElement.extend({
      constructor: function() {
        minim.StringElement.apply(this, arguments);
        this.element = 'myElement';
        this._attributeElementKeys = ['headers'];
      },

      ownMethod: function() {
        return 'It works!';
      }
    });
  });

  it('can extend the base element with its own method', function() {
    var myElement = new MyElement();
    expect(myElement.ownMethod()).to.equal('It works!');
  });

  context('when initializing', function() {
    var myElement;

    before(function() {
      myElement = new MyElement();
    });

    it('can overwrite the element name', function() {
      expect(myElement.element).to.equal('myElement');
    });

    it('returns the correct primitive element', function() {
      expect(myElement.primitive()).to.equal('string');
    });
  });

  describe('deserializing attributes', function() {
    var myElement;

    before(function() {
      myElement = new MyElement().fromRefract({
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
    });

    it('should create headers element instance', function() {
      expect(myElement.attributes.get('headers')).to.be.instanceof(minim.ArrayElement);
    });

    it('should leave foo alone', function() {
      expect(myElement.attributes.get('foo').toValue()).to.be.a('string');
    });
  });

  describe('serializing attributes', function() {
    var myElement;

    before(function() {
      myElement = new MyElement();
      myElement.attributes.set('headers', new minim.ArrayElement(['application/json']));
      myElement.attributes.get('headers').content[0].meta.set('name', 'Content-Type');
    });

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
