const { expect } = require('./spec-helper');
const minim = require('../lib/minim');
const { refract } = require('../lib/minim');

describe('refract', () => {
  it('returns any given element without refracting', () => {
    const element = new minim.StringElement('hello');
    const refracted = refract(element);

    expect(refracted).to.equal(element);
  });

  it('can refract a string into a string element', () => {
    const element = refract('Hello');

    expect(element).to.be.instanceof(minim.StringElement);
    expect(element.content).to.equal('Hello');
  });

  it('can refract a number into a number element', () => {
    const element = refract(1);

    expect(element).to.be.instanceof(minim.NumberElement);
    expect(element.content).to.equal(1);
  });

  it('can refract a boolean into a boolean element', () => {
    const element = refract(true);

    expect(element).to.be.instanceof(minim.BooleanElement);
    expect(element.content).to.equal(true);
  });

  it('can refract a null value into a null element', () => {
    const element = refract(null);

    expect(element).to.be.instanceof(minim.NullElement);
    expect(element.content).to.equal(null);
  });

  it('can refract an array of values into an array element', () => {
    const element = refract(['Hi', 1]);

    expect(element).to.be.instanceof(minim.ArrayElement);
    expect(element.length).to.be.equal(2);
    expect(element.get(0)).to.be.instanceof(minim.StringElement);
    expect(element.get(0).content).to.equal('Hi');
    expect(element.get(1)).to.be.instanceof(minim.NumberElement);
    expect(element.get(1).content).to.equal(1);
  });

  it('can refract an object into an object element', () => {
    const element = refract({ name: 'Doe' });

    expect(element).to.be.instanceof(minim.ObjectElement);
    expect(element.length).to.equal(1);

    const member = element.content[0];
    expect(member).to.be.instanceof(minim.MemberElement);
    expect(member.key).to.be.instanceof(minim.StringElement);
    expect(member.key.content).to.equal('name');
    expect(member.value).to.be.instanceof(minim.StringElement);
    expect(member.value.content).to.equal('Doe');
  });
});
