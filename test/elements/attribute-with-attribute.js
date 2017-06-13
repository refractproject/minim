var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var ObjectElement = minim.getElementClass('object');
var StringElement = minim.getElementClass('string');

describe('Element whose attribute has attribute', function() {
  var object, string;

  before(function () {
    object = new ObjectElement({
      foo: 'bar'
    });

    string = new StringElement('xyz');
    string.attributes.set('pqr', 1);

    object.attributes.set('baz', string);
  });

  it('returns the correct Refract value', function() {
    const value = object.attributes.get('baz').attributes.get('pqr').toValue();
    expect(value).to.equal(1);
  });
});
