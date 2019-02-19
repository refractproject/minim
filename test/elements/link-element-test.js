const { expect } = require('../spec-helper');
const minim = require('../../src/minim').namespace();

const LinkElement = minim.getElementClass('link');

describe('Link Element', function () {
  context('when creating an instance of LinkElement', function () {
    let link;

    before(function () {
      link = new LinkElement();
      link.relation = 'foo';
      link.href = '/bar';
    });

    it('sets the correct attributes', function () {
      expect(link.attributes.get('relation').toValue()).to.equal('foo');
      expect(link.attributes.get('href').toValue()).to.equal('/bar');
    });

    it('provides convenience methods', function () {
      expect(link.relation.toValue()).to.equal('foo');
      expect(link.href.toValue()).to.equal('/bar');
    });
  });
});
