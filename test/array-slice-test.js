var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');
var Element = minim.Element;
var StringElement = minim.StringElement;
var ArraySlice = minim.ArraySlice;

describe('ArraySlice', function () {
  it('can be created from an array of elements', function () {
    var element = new Element();
    var slice = new ArraySlice([element]);

    expect(slice.elements).to.deep.equal([element]);
  });

  it('returns the length of the slice', function () {
    var slice = new ArraySlice([new Element()]);

    expect(slice.length).to.equal(1);
  });

  it('returns when the slice is empty', function () {
    var slice = new ArraySlice();
    expect(slice.isEmpty).to.be.true;
  });

  it('returns when the slice is not empty', function () {
    var slice = new ArraySlice([new ArraySlice()]);
    expect(slice.isEmpty).to.be.false;
  });

  it('allows converting to value', function () {
    var element = new Element('hello');
    var slice = new ArraySlice([element]);

    expect(slice.toValue()).to.deep.equal(['hello']);
  });

  it('provides map', function () {
    var element = new Element('hello');
    var slice = new ArraySlice([element]);

    var mapped = slice.map(function (element) {
      return element.toValue();
    });

    expect(mapped).to.deep.equal(['hello']);
  });

  context('#filter', function () {
    it('filters elements satisfied from callback', function () {
      var one = new Element('one');
      var two = new Element('two');
      var slice = new ArraySlice([one, two]);

      var filtered = slice.filter(function (element) {
        return element.toValue() === 'one';
      });

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([one]);
    });

    it('filters elements satisfied from element class', function () {
      var one = new StringElement('one');
      var two = new Element('two');
      var slice = new ArraySlice([one, two]);

      var filtered = slice.filter(StringElement);

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([one]);
    });

    it('filters elements satisfied from element name', function () {
      var one = new StringElement('one');
      var two = new Element('two');
      var slice = new ArraySlice([one, two]);

      var filtered = slice.filter('string');

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([one]);
    });
  });

  context('#reject', function () {
    it('rejects elements satisfied from callback', function () {
      var one = new Element('one');
      var two = new Element('two');
      var slice = new ArraySlice([one, two]);

      var filtered = slice.reject(function (element) {
        return element.toValue() === 'one';
      });

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([two]);
    });

    it('rejects elements satisfied from element class', function () {
      var one = new StringElement('one');
      var two = new Element('two');
      var slice = new ArraySlice([one, two]);

      var filtered = slice.reject(StringElement);

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([two]);
    });

    it('rejects elements satisfied from element name', function () {
      var one = new StringElement('one');
      var two = new Element('two');
      var slice = new ArraySlice([one, two]);

      var filtered = slice.reject('string');

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([two]);
    });
  });

  describe('#find', function () {
    it('finds first element satisfied from callback', function () {
      var one = new Element('one');
      var two = new Element('two');
      var slice = new ArraySlice([one, two]);

      var element = slice.find(function (element) {
        return element.toValue() === 'two';
      });

      expect(element).to.be.equal(two);
    });

    it('finds first element satisfied from element class', function () {
      var one = new Element('one');
      var two = new StringElement('two');
      var slice = new ArraySlice([one, two]);

      var element = slice.find(StringElement);

      expect(element).to.be.equal(two);
    });

    it('finds first element satisfied from element name', function () {
      var one = new Element('one');
      var two = new StringElement('two');
      var slice = new ArraySlice([one, two]);

      var element = slice.find('string');

      expect(element).to.be.equal(two);
    });
  });

  it('provides flatMap', function () {
    var element = new Element('flat mapping for this element');
    var one = new Element('one');
    one.attributes.set('default', element);
    var two = new Element('two');
    var slice = new ArraySlice([one, two]);

    var titles = slice.flatMap(function (element) {
      return element.attributes.get('default');
    });

    expect(titles).to.deep.equal([element]);
  });

  it('provides forEach', function () {
    var one = new Element('one');
    var two = new Element('two');
    var slice = new ArraySlice([one, two]);

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
    var slice = new ArraySlice([
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
    var slice = new ArraySlice([one, two]);

    var shifted = slice.shift();

    expect(slice.length).to.equal(1);
    expect(shifted).to.equal(one);
  });

  it('allows unshifting an element', function () {
    var two = new Element('two');
    var slice = new ArraySlice([two]);

    slice.unshift('one');

    expect(slice.length).to.equal(2);
    expect(slice.get(0).toValue()).to.equal('one');
  });

  it('allows pushing new items to end', function () {
    var one = new Element('one');
    var slice = new ArraySlice([one]);

    slice.push('two');

    expect(slice.length).to.equal(2);
    expect(slice.get(1).toValue()).to.equal('two');
  });

  it('allows adding new items to end', function () {
    var one = new Element('one');
    var slice = new ArraySlice([one]);

    slice.add('two');

    expect(slice.length).to.equal(2);
    expect(slice.get(1).toValue()).to.equal('two');
  });

  it('allows getting an element via index', function () {
    var one = new Element('one');
    var slice = new ArraySlice([one]);
    expect(slice.get(0)).to.deep.equal(one);
  });

  it('allows getting a value via index', function () {
    var one = new Element('one');
    var slice = new ArraySlice([one]);
    expect(slice.getValue(0)).to.equal('one');
  });

  describe('#first', function () {
    it('returns the first item', function () {
      var element = new Element();
      var slice = new ArraySlice([element]);

      expect(slice.first).to.equal(element);
    });

    it('returns undefined when there isnt any items', function () {
      var slice = new ArraySlice();

      expect(slice.first).to.be.undefined;
    });
  });
});
