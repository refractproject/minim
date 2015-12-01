var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var LinkElement = minim.getElementClass('link');

describe('Link Element', function() {
  context('when creating an instance of LinkElement', function() {
    var link;

    before(function() {
      link = new LinkElement();
      link.relation = 'foo';
      link.href = '/bar';
    });

    it('sets the correct attributes', function() {
      expect(link.attributes.get('relation').toValue()).to.equal('foo');
      expect(link.attributes.get('href').toValue()).to.equal('/bar');
    });

    it('provides convenience methods', function() {
      expect(link.relation).to.equal('foo');
      expect(link.href).to.equal('/bar');
    });

    it('returns the correct Refract value', function() {
      expect(link.toRefract()).to.deep.equal({
        element: 'link',
        meta: {},
        attributes: {
          relation: 'foo',
          href: '/bar'
        },
        content: []
      });
    });
  });
});
