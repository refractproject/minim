var _ = require('lodash');
var expect = require('../../spec-helper').expect;
var minim = require('../../../lib/minim').namespace();

describe('Embedded Object', function() {
  context('when converting from embedded refract', function() {
    var baseValue = {
      first_name: 'John',
      last_name: 'Doe',
      age: 28,
      active: true,
      scores: [150, 202, 145]
    };

    context('when there are no refracted values', function() {
      var newValue;

      before(function() {
        newValue = minim.fromEmbeddedRefract(baseValue).toValue();
      });

      it('should convert correctly', function() {
        expect(newValue).to.deep.equal(baseValue);
      });
    });

    context('when there is a refracted string value', function() {
      var originalValue;
      var element;

      before(function() {
        originalValue = _.extend({}, baseValue, {
          first_name: {
            _refract: {
              element: 'string',
              content: 'John'
            }
          }
        });
        element = minim.fromEmbeddedRefract(originalValue);
      });

      it('should pick the correct element', function() {
        expect(element.get('first_name').element).to.equal('string');
      });

      it('should set the correct content', function() {
        expect(element.get('first_name').toValue()).to.equal('John');
      });
    });

    context('when there is a refracted number value', function() {
      var originalValue;
      var element;

      before(function() {
        originalValue = _.extend({}, baseValue, {
          age: {
            _refract: {
              element: 'number',
              content: 28
            }
          }
        });
        element = minim.fromEmbeddedRefract(originalValue);
      });

      it('should pick the correct element', function() {
        expect(element.get('age').element).to.equal('number');
      });

      it('should set the correct content', function() {
        expect(element.get('age').toValue()).to.equal(28);
      });
    });

    context('when there is a refracted boolean value', function() {
      var originalValue;
      var element;

      before(function() {
        originalValue = _.extend({}, baseValue, {
          active: {
            _refract: {
              element: 'boolean',
              content: true
            }
          }
        });
        element = minim.fromEmbeddedRefract(originalValue);
      });

      it('should pick the correct element', function() {
        expect(element.get('active').element).to.equal('boolean');
      });

      it('should set the correct content', function() {
        expect(element.get('active').toValue()).to.equal(true);
      });
    });

    context('when there is a refracted item in an array', function() {
      var originalValue;
      var element;

      before(function() {
        originalValue = _.extend({}, baseValue, {
          scores: [
            {
              "_refract": {
                "element": "number",
                "content": 150
              }
            },
            202,
            145
          ]
        });
        element = minim.fromEmbeddedRefract(originalValue);
      });

      it('should pick the correct element', function() {
        expect(element.get('scores').first().element).to.equal('number');
      });

      it('should set the correct content', function() {
        expect(element.get('scores').first().toValue()).to.equal(150);
      });

      it('should correctly parse the entire value', function() {
        expect(element.toValue()).to.deep.equal(baseValue);
      });
    });

    context('when there is a refracted array', function() {
      var originalValue;
      var element;

      before(function() {
        originalValue = _.extend({}, baseValue, {
          scores: {
            "_refract": {
              "element": "array",
              "content": [150, 202, 145]
            }
          }
        });
        element = minim.fromEmbeddedRefract(originalValue);
      });

      it('should pick the correct element', function() {
        expect(element.get('scores').first().element).to.equal('number');
      });

      it('should set the correct content', function() {
        expect(element.get('scores').first().toValue()).to.equal(150);
      });

      it('should correctly parse the entire value', function() {
        expect(element.toValue()).to.deep.equal(baseValue);
      });
    });

    context('when the refracted content is defined', function() {
      context('when the content is an object', function() {
        var originalValue;
        var element;

        before(function() {
          originalValue = _.extend({}, baseValue, {
            _refract: {
              element: 'object',
              content: {
                // Original is 28
                age: 30,
                foo: 'bar'
              }
            }
          });
          element = minim.fromEmbeddedRefract(originalValue);
        });

        it('should use the value from the original object', function() {
          expect(element.get('age').toValue()).to.equal(28);
        });

        it('should add the members of the content', function() {
          expect(element.get('foo').toValue()).to.equal('bar');
        });
      });
    });

    context('when the content is an array of member elements', function() {
      var originalValue;
      var element;

      before(function() {
        originalValue = _.extend({}, baseValue, {
          _refract: {
            element: 'object',
            content: [
              {
                key: 'age',
                value: 30
              },
              {
                _refract: {
                  element: 'member',
                  meta: {
                    id: 'foo-bar'
                  },
                  attributes: {
                    bar: 'baz'
                  }
                },
                key: 'foo',
                value: 'bar'
              },
              {
                key: {
                  _refract: {
                    element: 'string',
                    content: 'address'
                  }
                },
                value: {
                  _refract: {
                    element: 'string',
                    content: '1234 Main St.'
                  }
                }
              }
            ]
          }
        });
        element = minim.fromEmbeddedRefract(originalValue);
      });

      // FIXME: This should be 28!
      it('should use the value from the content for conflicts', function() {
        expect(element.get('age').toValue()).to.equal(28);
      });

      it('should add the members of the content', function() {
        expect(element.get('foo').toValue()).to.equal('bar');
      });

      it('should set the attributes when they are defined', function() {
        expect(element.getMember('foo').attributes.get('bar').toValue()).to.equal('baz');
      });

      it('should set the meta values when they are defined', function() {
        expect(element.getMember('foo').meta.get('id').toValue()).to.equal('foo-bar');
      });

      it('should parse refracted values for members', function() {
        expect(element.get('address').toValue()).to.equal('1234 Main St.');
      });
    });
  });

  context('when converting to embedded refract', function() {
    context('when there are no meta or attribute properites', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement({foo: 'bar'});
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({foo: 'bar'});
      });
    });

    context('when there are meta values', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement({foo: 'bar'});
        element.meta.set('title', 'Test Element')
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'object',
            meta: {
              title: 'Test Element'
            },
          },
          foo: 'bar'
        });
      });
    });

    context('when a member has meta values', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement({foo: 'bar'});
        element.getMember('foo').meta.set('title', 'Test Element')
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'object',
            content: [
              {
                _refract: {
                  element: 'member',
                  meta: {
                    title: 'Test Element'
                  }
                },
                key: 'foo',
                value: 'bar'
              }
            ]
          }
        });
      });
    });

    context('when a key has meta values', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement({foo: 'bar'});
        element.getKey('foo').meta.set('title', 'Test Element')
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'object',
            content: [
              {
                key: {
                  _refract: {
                    element: 'string',
                    meta: {
                      title: 'Test Element'
                    },
                    content: 'foo'
                  }
                },
                value: 'bar'
              }
            ]
          }
        });
      });
    });

    context('when a key is not a primitive element', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement({foo: 'bar'});
        element.getKey('foo').element = 'foo-element';
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'object',
            content: [
              {
                key: {
                  _refract: {
                    element: 'foo-element',
                    content: 'foo'
                  }
                },
                value: 'bar'
              }
            ]
          }
        });
      });
    });

    context('when a value has meta values', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement({foo: 'bar'});
        element.get('foo').meta.set('title', 'Test Element');
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          foo: {
            _refract: {
              element: 'string',
              meta: {
                title: 'Test Element'
              },
              content: 'bar'
            }
          }
        });
      });
    });
  });
});
