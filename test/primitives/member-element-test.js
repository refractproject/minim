var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var MemberElement = minim.getElementClass('member');

describe('MemberElement', function() {
  var member;

  beforeEach(function() {
    member = new MemberElement('foo', 'bar', {}, { foo: 'bar' });
  });

  it('correctly sets the key and value', function() {
    expect(member.key.toValue()).to.equal('foo');
    expect(member.value.toValue()).to.equal('bar');
  });

  it('correctly sets the attributes', function() {
    expect(member.attributes.get('foo').toValue()).to.equal('bar');
  });

  describe('#key', function() {
    it('sets keys parent during setter', function() {
      member.key = 'Hello';
      expect(member.key.parent).to.equal(member);
    });

    it('unsets existing keys parent during setter', function() {
      var existingKey = member.key;
      member.key = 'Hello';

      expect(existingKey.parent).to.be.undefined;
    });
  });

  describe('#value', function() {
    it('sets value parent during setter', function() {
      member.value = 'Hello';
      expect(member.value.parent).to.equal(member);
    });

    it('unsets existing valuess parent during setter', function() {
      var existingValue = member.value;
      member.value = 'Hello';

      expect(existingValue.parent).to.be.undefined;
    });
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
})
