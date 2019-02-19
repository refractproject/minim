const expect = require('../spec-helper').expect;
const minim = require('../../src/minim').namespace();

const MemberElement = minim.getElementClass('member');

describe('MemberElement', function () {
  const member = new MemberElement('foo', 'bar', {}, { foo: 'bar' });

  context('key', function () {
    it('provides the set key', function () {
      expect(member.key.toValue()).to.equal('foo');
    });

    it('sets the key', function () {
      member.key = 'updated';
      expect(member.key.toValue()).to.equal('updated');
    });
  });

  context('value', function () {
    it('provides the set value', function () {
      expect(member.value.toValue()).to.equal('bar');
    });

    it('sets the key', function () {
      member.value = 'updated';
      expect(member.value.toValue()).to.equal('updated');
    });
  });

  it('correctly sets the attributes', function () {
    expect(member.attributes.get('foo').toValue()).to.equal('bar');
  });
});
