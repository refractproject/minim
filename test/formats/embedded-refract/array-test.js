var _ = require('lodash');
var expect = require('../../spec-helper').expect;
var minim = require('../../../lib/minim').namespace();

describe('Embedded Boolean', function() {
  context('when converting from embedded refract', function() {
    context('when it is a normal array', function() {
      var value = [1, 2, 3];
      var element;

      before(function() {
        element = minim.fromEmbeddedRefract(value);
      });

      it('should parse the value correctly', function() {
        expect(element.toValue()).to.deep.equal([1, 2, 3]);
        expect(element.element).to.equal('array');
      });
    });

    context('when it is an embedded array', function() {
      var value = {
        _refract: {
          element: 'array',
          content: [1, 2, 3]
        }
      };
      var element;

      before(function() {
        element = minim.fromEmbeddedRefract(value);
      });

      it('should parse the value correctly', function() {
        expect(element.toValue()).to.deep.equal([1, 2, 3]);
        expect(element.element).to.equal('array');
      });
    });
  });

  context('when converting to embedded refract', function() {
    context('when there are no meta or attribute properites', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement([1, 2, 3]);
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal([1, 2, 3]);
      });
    });

    context('when there are attributes', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement([1, 2, 3]);
        element.attributes.set('foo', 'bar');
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'array',
            attributes: {
              foo: 'bar'
            },
            content: [1, 2, 3]
          }
        });
      });
    });

    context('when there are meta values', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement([1, 2, 3]);
        element.meta.set('title', 'Test Element')
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'array',
            meta: {
              title: 'Test Element'
            },
            content: [1, 2, 3]
          }
        });
      });
    });

    context('when an item has attributes', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement([1, 2, 3]);
        element.first().meta.set('title', 'Test Element');
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal([
          {
            _refract: {
              element: 'number',
              meta: {
                title: 'Test Element'
              },
              content: 1
            }
          },
          2,
          3
        ]);
      });
    });
  });
});
