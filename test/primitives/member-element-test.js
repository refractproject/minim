var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var MemberElement = minim.getElementClass('member');

describe('MemberElement', function() {
  var member = new MemberElement('foo', 'bar', {}, { foo: 'bar' });

  it('correctly sets the key and value', function() {
    expect(member.key.toValue()).to.equal('foo');
    expect(member.value.toValue()).to.equal('bar');
  });

  it('correctly sets the attributes', function() {
    expect(member.attributes.get('foo').toValue()).to.equal('bar');
  });
})
