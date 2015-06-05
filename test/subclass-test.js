var _ = require('lodash');
var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');

describe('Minim type subclasses', function() {
  // TODO: Provide better interface for extending elements
  var MyType = function() {
    minim.StringType.apply(this, arguments);
    this.element = 'myType';
    this._attributeElementKeys = ['headers'];
  }

  MyType.prototype = _.create(minim.StringType.prototype, {
    ownMethod: function() {
      return 'It works!';
    }
  });

  it('can extend the base element with its own method', function() {
    var myType = new MyType();
    expect(myType.ownMethod()).to.equal('It works!');
  });

  context('when initializing', function() {
    var myType = new MyType();

    it('can overwrite the element name', function() {
      expect(myType.element).to.equal('myType');
    });

    it('returns the correct primitive type', function() {
      expect(myType.primitive()).to.equal('string');
    });
  });

  describe('deserializing attributes', function() {
    var myType = new MyType().fromRefract({
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

    it('should create headers element instance', function() {
      expect(myType.attributes.headers).to.be.instanceof(minim.ArrayType);
    });

    it('should leave foo alone', function() {
      expect(myType.attributes.foo).to.be.a('string');
    });
  });

  describe('serializing attributes', function() {
    var myType = new MyType();
    myType.attributes.headers = new minim.ArrayType(['application/json']);
    myType.attributes.headers.content[0].meta.name = 'Content-Type';

    it('should serialize headers element', function() {
      var refracted = myType.toCompactRefract();

      expect(refracted).to.deep.equal(['myType', {}, {
        headers: ['array', {}, {}, [
            ['string', {name: 'Content-Type'}, {}, 'application/json']
        ]]
      }, null]);
    });
  });
});
