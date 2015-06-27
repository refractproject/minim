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

  context('when converting to embedded refract', function() {
    describe('NullElement', function() {
      context('when no attributes are set', function() {
        var element = new minim.NullElement();

        it('returns its value only', function() {
          expect(element.toEmbeddedRefract()).to.equal(null);
        });
      });

      context('when attributes have been set', function() {
        var element = new minim.NullElement(null, {}, { foo: 'bar' });

        it('returns an embedded refract object', function() {
          expect(element.toEmbeddedRefract()).to.deep.equal({
            refract: {
              element: 'null',
              meta: {},
              attributes: {
                foo: 'bar'
              },
              content: null
            }
          });
        });
      });
    });

    describe('StringElement', function() {
      context('when no attributes are set', function() {
        var element = new minim.StringElement('a');

        it('returns its value only', function() {
          expect(element.toEmbeddedRefract()).to.equal('a');
        });
      });

      context('when attributes have been set', function() {
        var element = new minim.StringElement('a', {}, { foo: 'bar' });

        it('returns an embedded refract object', function() {
          expect(element.toEmbeddedRefract()).to.deep.equal({
            refract: {
              element: 'string',
              meta: {},
              attributes: {
                foo: 'bar'
              },
              content: 'a'
            }
          });
        });
      });
    });

    describe('NumberElement', function() {
      context('when no attributes are set', function() {
        var element = new minim.NumberElement(4);

        it('returns its value only', function() {
          expect(element.toEmbeddedRefract()).to.equal(4);
        });
      });

      context('when attributes have been set', function() {
        var element = new minim.NumberElement(4, {}, { foo: 'bar' });

        it('returns an embedded refract object', function() {
          expect(element.toEmbeddedRefract()).to.deep.equal({
            refract: {
              element: 'number',
              meta: {},
              attributes: {
                foo: 'bar'
              },
              content: 4
            }
          });
        });
      });
    });

    describe('BooleanElement', function() {
      context('when no attributes are set', function() {
        var element = new minim.BooleanElement(true);

        it('returns its value only', function() {
          expect(element.toEmbeddedRefract()).to.equal(true);
        });
      });

      context('when attributes have been set', function() {
        var element = new minim.BooleanElement(true, {}, { foo: 'bar' });

        it('returns an embedded refract object', function() {
          expect(element.toEmbeddedRefract()).to.deep.equal({
            refract: {
              element: 'boolean',
              meta: {},
              attributes: {
                foo: 'bar'
              },
              content: true
            }
          });
        });
      });
    });

    describe('ArrayElement', function() {
      context('when no attributes are set', function() {
        var element = new minim.ArrayElement([1, 2]);

        it('returns its value only', function() {
          expect(element.toEmbeddedRefract()).to.deep.equal([1, 2]);
        });

        context('when an item has attributes', function() {
          var element = new minim.ArrayElement([1, 2]);
          element.first().attributes.set('foo', 'bar');

          it('embeds refract in the item with attributes', function() {
            expect(element.toEmbeddedRefract()).to.deep.equal([{
              refract: {
                element: 'number',
                meta: {},
                attributes: { foo: 'bar' },
                content: 1
              }
            }, 2]);
          });
        })
      });

      context('when attributes have been set', function() {
        var element = new minim.ArrayElement([1, 2], {}, { foo: 'bar' });

        it('returns an embedded refract object', function() {
          expect(element.toEmbeddedRefract()).to.deep.equal({
            refract: {
              element: 'array',
              meta: {},
              attributes: {
                foo: 'bar'
              },
              content: [
                {
                  element: 'number',
                  meta: {},
                  attributes: {},
                  content: 1
                },
                {
                  element: 'number',
                  meta: {},
                  attributes: {},
                  content: 2
                }
              ]
            }
          });
        });
      });
    });

    describe('ObjectElement', function() {
      context('when no attributes are set', function() {
        var element = new minim.ObjectElement({ a: 1, b: 2 });

        it('returns its value only', function() {
          expect(element.toEmbeddedRefract()).to.deep.equal({ a: 1, b: 2 });
        });

        context('when an item has attributes', function() {
          var element = new minim.ObjectElement({ a: 1, b: 2 });
          element.get('a').attributes.set('foo', 'bar');

          it('embeds refract in the item with attributes', function() {
            expect(element.toEmbeddedRefract()).to.deep.equal({
              a: {
                refract: {
                  element: 'number',
                  meta: {},
                  attributes: { foo: 'bar' },
                  content: 1
                }
              },
              b: 2
            });
          });
        })
      });

      context('when attributes have been set', function() {
        var element = new minim.ObjectElement({ a: 1, b: 2 }, {}, { foo: 'bar' });

        it('returns an embedded refract object', function() {
          expect(element.toEmbeddedRefract()).to.deep.equal({
            refract: {
              element: 'object',
              meta: {},
              attributes: { foo: 'bar' },
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
                      attributes: {},
                      content: 1
                    }
                  }
                },
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
            }
          });
        });
      });
    });
  });
});
