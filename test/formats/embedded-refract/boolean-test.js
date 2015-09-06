var _ = require('lodash');
var expect = require('../../spec-helper').expect;
var minim = require('../../../lib/minim').namespace();

describe('Embedded Boolean', function() {
  context('when converting from embedded refract', function() {
    context('when it is a normal boolean', function() {
      var value = true;
      var element;

      before(function() {
        element = minim.fromEmbeddedRefract(value);
      });

      it('should parse the value correctly', function() {
        expect(element.toValue()).to.equal(true);
        expect(element.element).to.equal('boolean');
      });
    });

    context('when it is an embedded boolean', function() {
      var value = {
        _refract: {
          element: 'boolean',
          content: true
        }
      };
      var element;

      before(function() {
        element = minim.fromEmbeddedRefract(value);
      });

      it('should parse the value correctly', function() {
        expect(element.toValue()).to.equal(true);
        expect(element.element).to.equal('boolean');
      });
    });
  });

  context('when converting to embedded refract', function() {
    context('when there are no meta or attribute properites', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement(true);
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the string value', function() {
        expect(embeddedRefract).to.equal(true);
      });
    });

    context('when there are attributes', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement(true);
        element.attributes.set('foo', 'bar');
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'boolean',
            attributes: {
              foo: 'bar'
            },
            content: true
          }
        });
      });
    });

    context('when there are meta values', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement(true);
        element.meta.set('title', 'Test Element')
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'boolean',
            meta: {
              title: 'Test Element'
            },
            content: true
          }
        });
      });
    });
  });
});
