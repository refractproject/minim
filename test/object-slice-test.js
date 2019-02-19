const { expect } = require('./spec-helper');
const minim = require('../src/minim');

const { MemberElement } = minim;
const { ObjectSlice } = minim;

describe('ObjectSlice', () => {
  it('provides map', () => {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
    ]);

    const result = slice.map(value => value.toValue());

    expect(result).to.deep.equal(['Doe']);
  });

  it('provides forEach', () => {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    const keys = [];
    const values = [];
    const members = [];
    const indexes = [];

    slice.forEach((value, key, member, index) => {
      keys.push(key.toValue());
      values.push(value.toValue());
      members.push(member);
      indexes.push(index);
    });

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

    const filtered = slice.filter(value => value.toValue() === 'Doe');

    expect(filtered).to.be.instanceof(ObjectSlice);
    expect(filtered.toValue()).to.deep.equal([{ key: 'name', value: 'Doe' }]);
  });

  it('provides reject', () => {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
      new MemberElement('name', 'Bill'),
    ]);

    const filtered = slice.reject(value => value.toValue() === 'Doe');

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
