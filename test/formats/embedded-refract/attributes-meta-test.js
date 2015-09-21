var _ = require('lodash');
var expect = require('../../spec-helper').expect;
var minim = require('../../../lib/minim').namespace();

describe('Embedded Attributes and Meta', function() {
  context('when attributes are defined', function() {
    context('when values are given', function() {
      var value;
      var element;

      before(function() {
        value = {
          _refract: {
            element: 'object',
            attributes: {
              foo: 'bar',
              baz: {
                _refract: {
                  element: 'number',
                  content: 100
                }
              }
            }
          },
          name: 'John Doe'
        };

        element = minim.fromEmbeddedRefract(value)
      });

      it('should parse the normal attributes', function() {
        expect(element.attributes.getValue('foo')).to.equal('bar');
      });

      it('should parse refracted attributes', function() {
        expect(element.attributes.getValue('baz')).to.equal(100);
      });
    });

    context('when meta properties are defined', function() {
      var value;
      var element;

      before(function() {
        value = {
          _refract: {
            element: 'object',
            meta: {
              id: 'foo-bar',
              title: {
                _refract: {
                  element: 'string',
                  content: 'Foo bar element'
                }
              }
            }
          },
          name: 'John Doe'
        };

        element = minim.fromEmbeddedRefract(value)
      });

      it('should parse the normal attributes', function() {
        expect(element.meta.getValue('id')).to.equal('foo-bar');
      });

      it('should parse refracted attributes', function() {
        expect(element.meta.getValue('title')).to.equal('Foo bar element');
      });
    });

    context('when values are not given in refract object', function() {
      var value;
      var element;

      before(function() {
        value = {
          _refract: {
            element: 'object',
            content: {
              name: {
                _refract: {
                  element: 'string',
                  meta: {
                    id: 'name-property'
                  }
                }
              }
            }
          },
          name: 'John Doe'
        };

        element = minim.fromEmbeddedRefract(value)
      });

      it('should store the value', function() {
        expect(element.get('name').toValue()).to.equal('John Doe');
      });

      it('should store the meta properties', function() {
        expect(element.get('name').meta.get('id').toValue()).to.equal('name-property');
      });
    });

    context('when there refracted object have a conflict', function() {
      var value;
      var element;

      before(function() {
        value = {
          _refract: {
            element: 'object',
            content: {
              name: {
                _refract: {
                  element: 'string',
                  meta: {
                    title: 'refract object'
                  },
                  attributes: {
                    foo: 'bar'
                  }
                }
              }
            }
          },
          name: {
            _refract: {
              element: 'string',
              meta: {
                title: 'normal object'
              },
              content: 'John Doe'
            }
          }
        };

        element = minim.fromEmbeddedRefract(value)
      });

      it('uses the normal object value instead of refract object', function() {
        var nameElement = element.get('name');
        expect(nameElement.meta.getValue('title')).to.equal('normal object');
        expect(nameElement.toValue()).to.equal('John Doe');
        expect(nameElement.attributes.get('foo')).to.be.undefined;
      });
    });
  });
});
