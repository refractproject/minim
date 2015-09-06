var _ = require('lodash');
var expect = require('../../spec-helper').expect;
var minim = require('../../../lib/minim').namespace();

describe('Embedded Number', function() {
  context('when converting from embedded refract', function() {
    context('when it is a normal number', function() {
      var value = 100;
      var element;

      before(function() {
        element = minim.fromEmbeddedRefract(value);
      });

      it('should parse the value correctly', function() {
        expect(element.toValue()).to.equal(100);
        expect(element.element).to.equal('number');
      });
    });

    context('when it is an embedded number', function() {
      var value = {
        _refract: {
          element: 'number',
          content: 100
        }
      };
      var element;

      before(function() {
        element = minim.fromEmbeddedRefract(value);
      });

      it('should parse the value correctly', function() {
        expect(element.toValue()).to.equal(100);
        expect(element.element).to.equal('number');
      });
    });
  });

  context('when converting to embedded refract', function() {
    context('when there are no meta or attribute properites', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement(100);
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the string value', function() {
        expect(embeddedRefract).to.equal(100);
      });
    });

    context('when there are attributes', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement(100);
        element.attributes.set('foo', 'bar');
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'number',
            attributes: {
              foo: 'bar'
            },
            content: 100
          }
        });
      });
    });

    context('when there are meta values', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement(100);
        element.meta.set('title', 'Test Element')
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'number',
            meta: {
              title: 'Test Element'
            },
            content: 100
          }
        });
      });
    });
  });
});
