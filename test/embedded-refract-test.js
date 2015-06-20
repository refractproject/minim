var _ = require('lodash');
var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');

describe('Embedded Refract', function() {
  context('when converting from embedded refract', function() {
    context('when given a normal object', function() {
      var obj = {
        foo: 'bar'
      };

      var element;

      before(function() {
        element = minim.convertFromEmbedded(obj);
      });

      it('returns the correct value', function() {
        expect(element.toValue()).to.deep.equal(obj);
      });
    });

    context('when given embedded refract object', function() {
      // An object { b: 2 } with embedded refract
      var obj = {
        refract: {
          element: 'object',
          meta: {
            id: 'test-id'
          },
          attributes: {
            a: 1
          }
        },
        b: 2
      }

      var refract = {
        element: 'object',
        meta: {
          id: 'test-id'
        },
        attributes: {
          a: 1
        },
        content: [
          {
            element: 'member',
            meta: {},
            attributes: {},
            content: {
              key: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'b'
              },
              value: {
                element: 'number',
                meta: {},
                attributes: {},
                content: 2
              }
            }
          }
        ]
      };

      var element;

      before(function() {
        element = minim.convertFromEmbedded(obj);
      });

      it('returns the correct value', function() {
        expect(element.toRefract()).to.deep.equal(refract);
      });
    });

    context('when a property is embedded refract', function() {
      // Object { a: 1, b: 2, c: 3 } but the value of `b` is embedded refract
      var obj = {
        a: 1,
        b: {
          refract: {
            element: 'number',
            content: 2
          }
        },
        c: 3
      };

      var expectedObj = {
        a: 1,
        b: 2,
        c: 3
      };

      var element;

      before(function() {
        element = minim.convertFromEmbedded(obj);
      });

      it('returns the correct value', function() {
        expect(element.toValue()).to.deep.equal(expectedObj);
      });
    });

    context('when an array has embedded refract', function() {
      // An array can have an embedded refract item
      var obj = {
        a: [
          {
            refract: {
              element: 'number',
              content: 1
            }
          },
          2,
          3
        ]
      };

      var expectedObj = {
        a: [1, 2, 3]
      };

      var element;

      before(function() {
        element = minim.convertFromEmbedded(obj);
      });

      it('returns the correct value', function() {
        expect(element.toValue()).to.deep.equal(expectedObj);
      });
    });

    context('when a non-object embedded refract has attributes', function() {
      // Properties of non-object Refract element become attributes
      // With objects, they become part of the content
      var obj = {
        a: {
          refract: {
            element: 'number',
            content: 1
          },
          foo: 'bar'
        }
      };

      var refract = {
        element: 'object',
        meta: {},
        attributes: {},
        content: [
          {
            element: 'member',
            meta: {},
            attributes: {},
            content: {
              key: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'a'
              },
              value: {
                element: 'number',
                meta: {},
                attributes: {
                  foo: 'bar'
                },
                content: 1
              }
            }
          }
        ]
      };

      var element;

      before(function() {
        element = minim.convertFromEmbedded(obj);
      });

      it('returns the correct value', function() {
        expect(element.toRefract()).to.deep.equal(refract);
      });
    });
  });
});
