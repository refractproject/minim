const { expect } = require('../spec-helper');
const minim = require('../../lib/minim').namespace();

const ObjectElement = minim.getElementClass('object');
const StringElement = minim.getElementClass('string');

describe('Element whose meta has meta', () => {
  let object; let string;

  before(() => {
    object = new ObjectElement({
      foo: 'bar',
    });

    string = new StringElement('xyz');
    string.meta.set('pqr', 1);

    object.meta.set('baz', string);
  });

  it('returns the correct Refract value', () => {
    const pqr = object.meta.get('baz').meta.getValue('pqr');
    expect(pqr).to.equal(1);
  });
});
