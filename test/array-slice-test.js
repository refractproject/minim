const { expect } = require('./spec-helper');
const minim = require('../src/minim');

const { Element } = minim;
const { StringElement } = minim;
const { ArraySlice } = minim;

describe('ArraySlice', function () {
  it('can be created from an array of elements', function () {
    const element = new Element();
    const slice = new ArraySlice([element]);

    expect(slice.elements).to.deep.equal([element]);
  });

  it('returns the length of the slice', function () {
    const slice = new ArraySlice([new Element()]);

    expect(slice.length).to.equal(1);
  });

  it('returns when the slice is empty', function () {
    const slice = new ArraySlice();
    expect(slice.isEmpty).to.be.true;
  });

  it('returns when the slice is not empty', function () {
    const slice = new ArraySlice([new ArraySlice()]);
    expect(slice.isEmpty).to.be.false;
  });

  it('allows converting to value', function () {
    const element = new Element('hello');
    const slice = new ArraySlice([element]);

    expect(slice.toValue()).to.deep.equal(['hello']);
  });

  it('provides map', function () {
    const element = new Element('hello');
    const slice = new ArraySlice([element]);

    const mapped = slice.map(function (element) {
      return element.toValue();
    });

    expect(mapped).to.deep.equal(['hello']);
  });

  context('#filter', function () {
    it('filters elements satisfied from callback', function () {
      const one = new Element('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.filter(function (element) {
        return element.toValue() === 'one';
      });

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([one]);
    });

    it('filters elements satisfied from element class', function () {
      const one = new StringElement('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.filter(elem => elem instanceof StringElement);

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([one]);
    });

    it('filters elements satisfied from element name', function () {
      const one = new StringElement('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.filter('string');

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([one]);
    });
  });

  context('#reject', function () {
    it('rejects elements satisfied from callback', function () {
      const one = new Element('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.reject(function (element) {
        return element.toValue() === 'one';
      });

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([two]);
    });

    it('rejects elements satisfied from element class', function () {
      const one = new StringElement('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.reject(elem => elem instanceof StringElement);

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([two]);
    });

    it('rejects elements satisfied from element name', function () {
      const one = new StringElement('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.reject('string');

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([two]);
    });
  });

  describe('#find', function () {
    it('finds first element satisfied from callback', function () {
      const one = new Element('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const element = slice.find(function (element) {
        return element.toValue() === 'two';
      });

      expect(element).to.be.equal(two);
    });

    it('finds first element satisfied from element class', function () {
      const one = new Element('one');
      const two = new StringElement('two');
      const slice = new ArraySlice([one, two]);

      const element = slice.find(elem => elem instanceof StringElement);

      expect(element).to.be.equal(two);
    });

    it('finds first element satisfied from element name', function () {
      const one = new Element('one');
      const two = new StringElement('two');
      const slice = new ArraySlice([one, two]);

      const element = slice.find('string');

      expect(element).to.be.equal(two);
    });
  });

  it('provides flatMap', function () {
    const element = new Element('flat mapping for this element');
    const one = new Element('one');
    one.attributes.set('default', element);
    const two = new Element('two');
    const slice = new ArraySlice([one, two]);

    const titles = slice.compactMap(function (element) {
      return element.attributes.get('default');
    });

    expect(titles).to.deep.equal([element]);
  });

  it('provides compactMap', function () {
    const element = new Element('compact mapping for this element');
    const one = new Element('one');
    one.attributes.set('default', element);
    const two = new Element('two');
    const slice = new ArraySlice([one, two]);

    const titles = slice.compactMap(function (element) {
      return element.attributes.get('default');
    });

    expect(titles).to.deep.equal([element]);
  });

  it('provides forEach', function () {
    const one = new Element('one');
    const two = new Element('two');
    const slice = new ArraySlice([one, two]);

    const elements = [];
    const indexes = [];

    slice.forEach(function (element, index) {
      elements.push(element);
      indexes.push(index);
    });

    expect(elements).to.deep.equal([one, two]);
    expect(indexes).to.deep.equal([0, 1]);
  });

  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Examples
   */
  it('provides reduce to sum all the values of an array', function () {
    const slice = new ArraySlice([0, 1, 2, 3]);

    const sum = slice.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    expect(sum).to.equal(6);
  });

  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Examples
   */
  it('provides reduce to flatten an array of arrays', function () {
    const slice = new ArraySlice([[0, 1], [2, 3], [4, 5]]);

    const flattened = slice.reduce(
      function (accumulator, currentValue) {
        return accumulator.concat(currentValue);
      },
      []
    );

    expect(flattened).to.deep.equal([0, 1, 2, 3, 4, 5]);
  });

  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#Alternative
   */
  it('provides flatMap as an alternative to reduce', function () {
    const arr1 = new ArraySlice([1, 2, 3, 4]);

    const reduced = arr1.reduce(
      function (acc, x) {
        return acc.concat([x * 2]);
      },
      []
    );

    expect(reduced).to.deep.equal([2, 4, 6, 8]);

    const flattened = arr1.flatMap(function (x) {
      return [x * 2];
    });

    expect(flattened).to.deep.equal(reduced);
  });

  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#Examples
   */
  it('provides flatMap to flatten one level', function () {
    const arr1 = new ArraySlice([1, 2, 3, 4]);

    const mapped = arr1.map(function (x) {
      return [x * 2];
    });

    expect(mapped).to.deep.equal([[2], [4], [6], [8]]);

    const flattened = arr1.flatMap(function (x) {
      return [x * 2];
    });

    expect(flattened).to.deep.equal([2, 4, 6, 8]);

    const flattenOnce = arr1.flatMap(function (x) {
      return [[x * 2]];
    });

    expect(flattenOnce).to.deep.equal([[2], [4], [6], [8]]);
  });

  describe('#includes', function () {
    const slice = new ArraySlice([
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
    const one = new Element('one');
    const two = new Element('two');
    const slice = new ArraySlice([one, two]);

    const shifted = slice.shift();

    expect(slice.length).to.equal(1);
    expect(shifted).to.equal(one);
  });

  it('allows unshifting an element', function () {
    const two = new Element('two');
    const slice = new ArraySlice([two]);

    slice.unshift('one');

    expect(slice.length).to.equal(2);
    expect(slice.get(0).toValue()).to.equal('one');
  });

  it('allows pushing new items to end', function () {
    const one = new Element('one');
    const slice = new ArraySlice([one]);

    slice.push('two');

    expect(slice.length).to.equal(2);
    expect(slice.get(1).toValue()).to.equal('two');
  });

  it('allows adding new items to end', function () {
    const one = new Element('one');
    const slice = new ArraySlice([one]);

    slice.add('two');

    expect(slice.length).to.equal(2);
    expect(slice.get(1).toValue()).to.equal('two');
  });

  it('allows getting an element via index', function () {
    const one = new Element('one');
    const slice = new ArraySlice([one]);
    expect(slice.get(0)).to.deep.equal(one);
  });

  it('allows getting a value via index', function () {
    const one = new Element('one');
    const slice = new ArraySlice([one]);
    expect(slice.getValue(0)).to.equal('one');
  });

  describe('#first', function () {
    it('returns the first item', function () {
      const element = new Element();
      const slice = new ArraySlice([element]);

      expect(slice.first).to.equal(element);
    });

    it('returns undefined when there isnt any items', function () {
      const slice = new ArraySlice();

      expect(slice.first).to.be.undefined;
    });
  });
});
