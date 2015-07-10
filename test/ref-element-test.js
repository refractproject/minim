var _ = require('lodash');
var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');

describe('RefElement', function() {
  context('when initializing with a string', function() {
    var ref;

    before(function() {
      ref = new minim.RefElement('foo');
    });

    it('has the correct values', function() {
      expect(ref.content.href).to.equal('foo');
    });
  });

  context('when initializing with an object', function() {
    var ref;
    var content = {
      href: 'foo',
      path: 'content'
    }

    before(function() {
      ref = new minim.RefElement(content);
    });

    it('has the correct values', function() {
      expect(ref.content).to.deep.equal(content);
    });
  });

  context('when converting to Refract', function() {
    var ref;
    var expectedRefract = {
      element: 'ref',
      meta: {},
      attributes: {},
      content: {
        href: 'foo'
      }
    };

    before(function() {
      ref = new minim.RefElement('foo');
    });

    it('returns the correct value', function() {
      expect(ref.toRefract()).to.deep.equal(expectedRefract);
    });
  });

  context('when converting to Compact Refract', function() {
    var ref;
    var expectedRefract = ['ref', {}, {}, { href: 'foo' }];

    before(function() {
      ref = new minim.RefElement('foo');
    });

    it('returns the correct value', function() {
      expect(ref.toCompactRefract()).to.deep.equal(expectedRefract);
    });
  });

  context('when getting the referenced instance', function() {
    var instance;
    var ref;

    before(function() {
      instance = new minim.StringElement('foo', { id: 'bar' });
      ref = new minim.RefElement('bar');
      ref.instance = instance;
    });

    it('returns the correct instance', function() {
      expect(ref.instance).to.equal(instance);
    });
  });
});
