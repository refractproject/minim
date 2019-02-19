const expect = require('../spec-helper').expect;
const minim = require('../../src/minim').namespace();

const ObjectElement = minim.getElementClass('object');
const StringElement = minim.getElementClass('string');

describe('Element whose meta has meta', function () {
  let object; let string;

  before(function () {
    object = new ObjectElement({
      foo: 'bar',
    });

    string = new StringElement('xyz');
    string.meta.set('pqr', 1);

    object.meta.set('baz', string);
  });

  it('returns the correct Refract value', function () {
    const pqr = object.meta.get('baz').meta.getValue('pqr');
    expect(pqr).to.equal(1);
  });
});
