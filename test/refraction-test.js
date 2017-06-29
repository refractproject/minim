var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');
var refract = require('../lib/refraction').refract;

describe('refract', function() {
  it('returns any given element without refracting', function() {
    var element = new minim.StringElement('hello');
    var refracted = refract(element);

    expect(refracted).to.equal(element);
  });

  it('can refract a string into a string element', function() {
    var element = refract('Hello');

    expect(element).to.be.instanceof(minim.StringElement);
    expect(element.content).to.equal('Hello');
  });

  it('can refract a number into a number element', function() {
    var element = refract(1);

    expect(element).to.be.instanceof(minim.NumberElement);
    expect(element.content).to.equal(1);
  });

  it('can refract a boolean into a boolean element', function() {
    var element = refract(true);

    expect(element).to.be.instanceof(minim.BooleanElement);
    expect(element.content).to.equal(true);
  });

  it('can refract a null value into a null element', function() {
    var element = refract(null);

    expect(element).to.be.instanceof(minim.NullElement);
    expect(element.content).to.equal(null);
  });

  it('can refract an array of values into an array element', function() {
    var element = refract(['Hi', 1]);

    expect(element).to.be.instanceof(minim.ArrayElement);
    expect(element.length).to.be.equal(2);
    expect(element.get(0)).to.be.instanceof(minim.StringElement);
    expect(element.get(0).content).to.equal('Hi');
    expect(element.get(1)).to.be.instanceof(minim.NumberElement);
    expect(element.get(1).content).to.equal(1);
  });

  it('can refract an object into an object element', function() {
    var element = refract({'name': 'Doe'});

    expect(element).to.be.instanceof(minim.ObjectElement);
    expect(element.length).to.equal(1);

    var member = element.content[0];
    expect(member).to.be.instanceof(minim.MemberElement);
    expect(member.key).to.be.instanceof(minim.StringElement);
    expect(member.key.content).to.equal('name');
    expect(member.value).to.be.instanceof(minim.StringElement);
    expect(member.value.content).to.equal('Doe');
  });
});
