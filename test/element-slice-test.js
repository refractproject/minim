var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');
var Element = minim.Element;
var ElementSlice = minim.ElementSlice;

describe('ElementSlice', function () {
  it('can be created from an array of elements', function () {
    var element = new Element();
    var slice = new ElementSlice([element]);

    expect(slice.elements).to.deep.equal([element]);
  });

  it('returns the length of the slice', function () {
    var slice = new ElementSlice([new Element()]);

    expect(slice.length).to.equal(1);
  });

  it('returns when the slice is empty', function () {
    var slice = new ElementSlice();
    expect(slice.isEmpty).to.be.true;
  });

  it('returns when the slice is not empty', function () {
    var slice = new ElementSlice([new ElementSlice()]);
    expect(slice.isEmpty).to.be.false;
  });

  it('allows converting to value', function () {
    var element = new Element('hello');
    var slice = new ElementSlice([element]);

    expect(slice.toValue()).to.deep.equal(['hello']);
  });

  it('provides map', function () {
    var element = new Element('hello');
    var slice = new ElementSlice([element]);

    var mapped = slice.map(function (element) {
      return element.toValue();
    });

    expect(mapped).to.deep.equal(['hello']);
  });

  it('provides filter', function () {
    var one = new Element('one');
    var two = new Element('two');
    var slice = new ElementSlice([one, two]);

    var filtered = slice.filter(function (element) {
      return element.toValue() === 'one';
    });

    expect(filtered).to.be.instanceof(ElementSlice);
    expect(filtered.elements).to.deep.equal([one]);
  });

  it('provides forEach', function () {
    var one = new Element('one');
    var two = new Element('two');
    var slice = new ElementSlice([one, two]);

    var elements = [];
    var indexes = [];

    slice.forEach(function (element, index) {
      elements.push(element);
      indexes.push(index);
    });

    expect(elements).to.deep.equal([one, two]);
    expect(indexes).to.deep.equal([0, 1]);
  });

  describe('#includes', function () {
    var slice = new ElementSlice([
      new Element('one'),
      new Element('two'),
    ]);

    it('returns true when the slice contains an matching value', function () {
      expect(slice.includes('one')).to.be.true;
    });

    it('returns false when there are no matches', function () {
      expect(slice.includes('three')).to.be.false;
    });
  });

  it('allows shifting an element', function () {
    var one = new Element('one');
    var two = new Element('two');
    var slice = new ElementSlice([one, two]);

    var shifted = slice.shift();

    expect(slice.length).to.equal(1);
    expect(shifted).to.equal(one);
  });

  it('allows unshifting an element', function () {
    var two = new Element('two');
    var slice = new ElementSlice([two]);

    slice.unshift('one');

    expect(slice.length).to.equal(2);
    expect(slice.get(0).toValue()).to.equal('one');
  });

  it('allows pushing new items to end', function () {
    var one = new Element('one');
    var slice = new ElementSlice([one]);

    slice.push('two');

    expect(slice.length).to.equal(2);
    expect(slice.get(1).toValue()).to.equal('two');
  });

  it('allows adding new items to end', function () {
    var one = new Element('one');
    var slice = new ElementSlice([one]);

    slice.add('two');

    expect(slice.length).to.equal(2);
    expect(slice.get(1).toValue()).to.equal('two');
  });

  it('allows getting an element via index', function () {
    var one = new Element('one');
    var slice = new ElementSlice([one]);
    expect(slice.get(0)).to.deep.equal(one);
  });

  it('allows getting a value via index', function () {
    var one = new Element('one');
    var slice = new ElementSlice([one]);
    expect(slice.getValue(0)).to.equal('one');
  });
});
