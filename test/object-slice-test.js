const { expect } = require('./spec-helper');
const { MemberElement, ObjectSlice } = require('../lib/minim');

describe('ObjectSlice', () => {
  const thisArg = { message: 42 };

  it('provides map', () => {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
    ]);

    const result = slice.map(function map(value) {
      expect(this).to.deep.equal(thisArg);
      return value.toValue();
    }, thisArg);

    expect(result).to.deep.equal(['Doe']);
  });

  it('provides forEach', () => {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    const keys = [];
    const values = [];
    const members = [];
    const indexes = [];

    slice.forEach(function forEach(value, key, member, index) {
      keys.push(key.toValue());
      values.push(value.toValue());
      members.push(member);
      indexes.push(index);

      expect(this).to.deep.equal(thisArg);
    }, thisArg);

    expect(keys).to.deep.equal(['name']);
    expect(values).to.deep.equal(['Doe']);
    expect(members).to.deep.equal([element]);
    expect(indexes).to.deep.equal([0]);
  });

  it('provides filter', () => {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
      new MemberElement('name', 'Bill'),
    ]);

    const filtered = slice.filter(function filter(value) {
      expect(this).to.deep.equal(thisArg);
      return value.toValue() === 'Doe';
    }, thisArg);

    expect(filtered).to.be.instanceof(ObjectSlice);
    expect(filtered.toValue()).to.deep.equal([{ key: 'name', value: 'Doe' }]);
  });

  it('provides reject', () => {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
      new MemberElement('name', 'Bill'),
    ]);

    const filtered = slice.reject(function filter(value) {
      expect(this).to.deep.equal(thisArg);
      return value.toValue() === 'Doe';
    }, thisArg);

    expect(filtered).to.be.instanceof(ObjectSlice);
    expect(filtered.toValue()).to.deep.equal([{ key: 'name', value: 'Bill' }]);
  });

  it('provides keys', () => {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    expect(slice.keys()).to.deep.equal(['name']);
  });

  it('provides values', () => {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    expect(slice.values()).to.deep.equal(['Doe']);
  });
});
