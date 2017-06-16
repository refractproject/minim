var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim');
var RefElement = minim.RefElement;
var StringElement = minim.StringElement;

describe('Ref Element', function() {
  it('has ref element name', function() {
    var element = new RefElement();

    expect(element.element).to.equal('ref');
  });

  it('has a default path of element', function() {
    var element = new RefElement();

    expect(element.path.toValue()).to.equal('element');
  });

  it('can set the ref element path', function() {
    var element = new RefElement();
    element.path = 'attributes';

    var path = element.attributes.get('path');

    expect(path).to.be.instanceof(StringElement);
    expect(path.toValue()).to.be.equal('attributes');
  });

  it('can get the ref element path', function() {
    var element = new RefElement();
    element.attributes.set('path', 'attributes');

    expect(element.path).to.be.instanceof(StringElement);
    expect(element.path.toValue()).to.be.equal('attributes');
  });
});
