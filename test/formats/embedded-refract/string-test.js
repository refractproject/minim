var _ = require('lodash');
var expect = require('../../spec-helper').expect;
var minim = require('../../../lib/minim').namespace();

describe('Embedded String', function() {
  context('when converting from embedded refract', function() {
    context('when it is a normal string', function() {
      var value = 'foobar';
      var element;

      before(function() {
        element = minim.fromEmbeddedRefract(value);
      });

      it('should parse the value correctly', function() {
        expect(element.toValue()).to.equal('foobar');
        expect(element.element).to.equal('string');
      });
    });

    context('when it is an embedded string', function() {
      var value = {
        _refract: {
          element: 'string',
          content: 'foobar'
        }
      };
      var element;

      before(function() {
        element = minim.fromEmbeddedRefract(value);
      });

      it('should parse the value correctly', function() {
        expect(element.toValue()).to.equal('foobar');
        expect(element.element).to.equal('string');
      });
    });
  });

  context('when converting to embedded refract', function() {
    context('when there are no meta or attribute properites', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement('foobar');
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the string value', function() {
        expect(embeddedRefract).to.equal('foobar');
      });
    });

    context('when there are attributes', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement('foobar');
        element.attributes.set('foo', 'bar');
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'string',
            attributes: {
              foo: 'bar'
            },
            content: 'foobar'
          }
        });
      });
    });

    context('when there are meta values', function() {
      var element;
      var embeddedRefract;

      before(function() {
        element = minim.toElement('foobar');
        element.meta.set('title', 'Test Element');
        embeddedRefract = element.toEmbeddedRefract();
      });

      it('should return the correct value', function() {
        expect(embeddedRefract).to.deep.equal({
          _refract: {
            element: 'string',
            meta: {
              title: 'Test Element'
            },
            content: 'foobar'
          }
        });
      });
    });
  });
});
