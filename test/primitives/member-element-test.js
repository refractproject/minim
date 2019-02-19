const { expect } = require('../spec-helper');
const minim = require('../../src/minim').namespace();

const MemberElement = minim.getElementClass('member');

describe('MemberElement', () => {
  const member = new MemberElement('foo', 'bar', {}, { foo: 'bar' });

  context('key', () => {
    it('provides the set key', () => {
      expect(member.key.toValue()).to.equal('foo');
    });

    it('sets the key', () => {
      member.key = 'updated';
      expect(member.key.toValue()).to.equal('updated');
    });
  });

  context('value', () => {
    it('provides the set value', () => {
      expect(member.value.toValue()).to.equal('bar');
    });

    it('sets the key', () => {
      member.value = 'updated';
      expect(member.value.toValue()).to.equal('updated');
    });
  });

  it('correctly sets the attributes', () => {
    expect(member.attributes.get('foo').toValue()).to.equal('bar');
  });
});
