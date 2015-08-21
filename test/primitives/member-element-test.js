var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim');

describe('MemberElement', function() {
  var member = new minim.MemberElement('foo', 'bar', {}, { foo: 'bar' });

  it('correctly sets the key and value', function() {
    expect(member.key.toValue()).to.equal('foo');
    expect(member.value.toValue()).to.equal('bar');
  });

  it('correctly sets the attributes', function() {
    expect(member.attributes.get('foo').toValue()).to.equal('bar');
  });

  describe('#toValue', function () {
    it('returns a hash with key and value', function () {
      expect(member.toValue()).to.deep.equal({ key: 'foo', value: 'bar' });
    });
  });

  describe('#toRefract', function() {
    it('returns the correct Refract value', function() {
      expect(member.toRefract()).to.deep.equal({
        element: 'member',
        meta: {},
        attributes: { foo: 'bar' },
        content: {
          key: {
            element: 'string',
            meta: {},
            attributes: {},
            content: 'foo'
          },
          value: {
            element: 'string',
            meta: {},
            attributes: {},
            content: 'bar'
          }
        }
      });
    });
  });

  describe('#toCompactRefract', function() {
    it('returns the correct compact Refract value', function() {
      expect(member.toCompactRefract()).to.deep.equal([
        'member', {}, { foo: 'bar' }, {
          key: ['string', {}, {}, 'foo'],
          value: ['string', {}, {}, 'bar'],
        }
      ]);
    });
  });
})
