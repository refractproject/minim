const { expect } = require('./spec-helper');
const minim = require('../src/minim');

const { Element } = minim;
const { StringElement } = minim;
const { ArraySlice } = minim;

describe('ArraySlice', () => {
  const thisArg = { message: 42 };

  it('can be created from an array of elements', () => {
    const element = new Element();
    const slice = new ArraySlice([element]);

    expect(slice.elements).to.deep.equal([element]);
  });

  it('returns the length of the slice', () => {
    const slice = new ArraySlice([new Element()]);

    expect(slice.length).to.equal(1);
  });

  it('returns when the slice is empty', () => {
    const slice = new ArraySlice();
    expect(slice.isEmpty).to.be.true;
  });

  it('returns when the slice is not empty', () => {
    const slice = new ArraySlice([new ArraySlice()]);
    expect(slice.isEmpty).to.be.false;
  });

  it('allows converting to value', () => {
    const element = new Element('hello');
    const slice = new ArraySlice([element]);

    expect(slice.toValue()).to.deep.equal(['hello']);
  });

  it('provides map', () => {
    const element = new Element('hello');
    const slice = new ArraySlice([element]);

    const mapped = slice.map(function map(e) {
      expect(this).to.deep.equal(thisArg);
      return e.toValue();
    }, thisArg);

    expect(mapped).to.deep.equal(['hello']);
  });

  context('#filter', () => {
    it('filters elements satisfied from callback', () => {
      const one = new Element('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.filter(function filter(element) {
        expect(this).to.deep.equal(thisArg);
        return element.toValue() === 'one';
      }, thisArg);

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([one]);
    });

    it('filters elements satisfied from element class', () => {
      const one = new StringElement('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.filter(elem => elem instanceof StringElement);

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([one]);
    });

    it('filters elements satisfied from element name', () => {
      const one = new StringElement('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.filter('string');

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([one]);
    });
  });

  context('#reject', () => {
    it('rejects elements satisfied from callback', () => {
      const one = new Element('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.reject(function filter(element) {
        expect(this).to.deep.equal(thisArg);
        return element.toValue() === 'one';
      }, thisArg);

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([two]);
    });

    it('rejects elements satisfied from element class', () => {
      const one = new StringElement('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.reject(elem => elem instanceof StringElement);

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([two]);
    });

    it('rejects elements satisfied from element name', () => {
      const one = new StringElement('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const filtered = slice.reject('string');

      expect(filtered).to.be.instanceof(ArraySlice);
      expect(filtered.elements).to.deep.equal([two]);
    });
  });

  describe('#find', () => {
    it('finds first element satisfied from callback', () => {
      const one = new Element('one');
      const two = new Element('two');
      const slice = new ArraySlice([one, two]);

      const element = slice.find(e => e.toValue() === 'two');

      expect(element).to.be.equal(two);
    });

    it('finds first element satisfied from element class', () => {
      const one = new Element('one');
      const two = new StringElement('two');
      const slice = new ArraySlice([one, two]);

      const element = slice.find(elem => elem instanceof StringElement);

      expect(element).to.be.equal(two);
    });

    it('finds first element satisfied from element name', () => {
      const one = new Element('one');
      const two = new StringElement('two');
      const slice = new ArraySlice([one, two]);

      const element = slice.find('string');

      expect(element).to.be.equal(two);
    });
  });

  it('provides flatMap', () => {
    const element = new Element('flat mapping for this element');
    const one = new Element('one');
    one.attributes.set('default', element);
    const two = new Element('two');
    const slice = new ArraySlice([one, two]);

    const titles = slice.flatMap(function flatMap(e) {
      expect(this).to.deep.equal(thisArg);
      const defaultAttribute = e.attributes.get('default');

      if (defaultAttribute) {
        return [defaultAttribute];
      }

      return [];
    }, thisArg);

    expect(titles).to.deep.equal([element]);
  });

  it('provides compactMap', () => {
    const element = new Element('compact mapping for this element');
    const one = new Element('one');
    one.attributes.set('default', element);
    const two = new Element('two');
    const slice = new ArraySlice([one, two]);

    const titles = slice.compactMap(function compactMap(e) {
      expect(this).to.deep.equal(thisArg);
      return e.attributes.get('default');
    }, thisArg);

    expect(titles).to.deep.equal([element]);
  });

  it('provides forEach', () => {
    const one = new Element('one');
    const two = new Element('two');
    const slice = new ArraySlice([one, two]);

    const elements = [];
    const indexes = [];

    slice.forEach(function forEach(element, index) {
      elements.push(element);
      indexes.push(index);
      expect(this).to.deep.equal(thisArg);
    }, thisArg);

    expect(elements).to.deep.equal([one, two]);
    expect(indexes).to.deep.equal([0, 1]);
  });

  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Examples
   */
  it('provides reduce to sum all the values of an array', () => {
    const slice = new ArraySlice([0, 1, 2, 3]);

    const sum = slice.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    expect(sum).to.equal(6);
  });

  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Examples
   */
  it('provides reduce to flatten an array of arrays', () => {
    const slice = new ArraySlice([[0, 1], [2, 3], [4, 5]]);

    const flattened = slice.reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue),
      []
    );

    expect(flattened).to.deep.equal([0, 1, 2, 3, 4, 5]);
  });

  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#Alternative
   */
  it('provides flatMap as an alternative to reduce', () => {
    const arr1 = new ArraySlice([1, 2, 3, 4]);

    const reduced = arr1.reduce(
      (acc, x) => acc.concat([x * 2]),
      []
    );

    expect(reduced).to.deep.equal([2, 4, 6, 8]);

    const flattened = arr1.flatMap(x => [x * 2]);

    expect(flattened).to.deep.equal(reduced);
  });

  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#Examples
   */
  it('provides flatMap to flatten one level', () => {
    const arr1 = new ArraySlice([1, 2, 3, 4]);

    const mapped = arr1.map(x => [x * 2]);

    expect(mapped).to.deep.equal([[2], [4], [6], [8]]);

    const flattened = arr1.flatMap(x => [x * 2]);

    expect(flattened).to.deep.equal([2, 4, 6, 8]);

    const flattenOnce = arr1.flatMap(x => [[x * 2]]);

    expect(flattenOnce).to.deep.equal([[2], [4], [6], [8]]);
  });

  describe('#includes', () => {
    const slice = new ArraySlice([
      new Element('one'),
      new Element('two'),
    ]);

    it('returns true when the slice contains an matching value', () => {
      expect(slice.includes('one')).to.be.true;
    });

    it('returns false when there are no matches', () => {
      expect(slice.includes('three')).to.be.false;
    });
  });

  it('allows shifting an element', () => {
    const one = new Element('one');
    const two = new Element('two');
    const slice = new ArraySlice([one, two]);

    const shifted = slice.shift();

    expect(slice.length).to.equal(1);
    expect(shifted).to.equal(one);
  });

  it('allows unshifting an element', () => {
    const two = new Element('two');
    const slice = new ArraySlice([two]);

    slice.unshift('one');

    expect(slice.length).to.equal(2);
    expect(slice.get(0).toValue()).to.equal('one');
  });

  it('allows pushing new items to end', () => {
    const one = new Element('one');
    const slice = new ArraySlice([one]);

    slice.push('two');

    expect(slice.length).to.equal(2);
    expect(slice.get(1).toValue()).to.equal('two');
  });

  it('allows adding new items to end', () => {
    const one = new Element('one');
    const slice = new ArraySlice([one]);

    slice.add('two');

    expect(slice.length).to.equal(2);
    expect(slice.get(1).toValue()).to.equal('two');
  });

  it('allows getting an element via index', () => {
    const one = new Element('one');
    const slice = new ArraySlice([one]);
    expect(slice.get(0)).to.deep.equal(one);
  });

  it('allows getting a value via index', () => {
    const one = new Element('one');
    const slice = new ArraySlice([one]);
    expect(slice.getValue(0)).to.equal('one');
  });

  describe('#first', () => {
    it('returns the first item', () => {
      const element = new Element();
      const slice = new ArraySlice([element]);

      expect(slice.first).to.equal(element);
    });

    it('returns undefined when there isnt any items', () => {
      const slice = new ArraySlice();

      expect(slice.first).to.be.undefined;
    });
  });
});
