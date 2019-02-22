const { expect } = require('../spec-helper');
const minim = require('../../lib/minim');

const { RefElement } = minim;
const { StringElement } = minim;

describe('Ref Element', () => {
  it('has ref element name', () => {
    const element = new RefElement();

    expect(element.element).to.equal('ref');
  });

  it('has a default path of element', () => {
    const element = new RefElement();

    expect(element.path.toValue()).to.equal('element');
  });

  it('can set the ref element path', () => {
    const element = new RefElement();
    element.path = 'attributes';

    const path = element.attributes.get('path');

    expect(path).to.be.instanceof(StringElement);
    expect(path.toValue()).to.be.equal('attributes');
  });

  it('can get the ref element path', () => {
    const element = new RefElement();
    element.attributes.set('path', 'attributes');

    expect(element.path).to.be.instanceof(StringElement);
    expect(element.path.toValue()).to.be.equal('attributes');
  });
});
