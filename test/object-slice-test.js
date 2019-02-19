const { expect } = require('./spec-helper');
const minim = require('../src/minim');

const { MemberElement } = minim;
const { ObjectSlice } = minim;

describe('ObjectSlice', function () {
  it('provides map', function () {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
    ]);

    const result = slice.map(function (value) {
      return value.toValue();
    });

    expect(result).to.deep.equal(['Doe']);
  });

  it('provides forEach', function () {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    const keys = [];
    const values = [];
    const members = [];
    const indexes = [];

    slice.forEach(function (value, key, member, index) {
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

  it('provides filter', function () {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
      new MemberElement('name', 'Bill'),
    ]);

    const filtered = slice.filter(function (value) {
      return value.toValue() === 'Doe';
    });

    expect(filtered).to.be.instanceof(ObjectSlice);
    expect(filtered.toValue()).to.deep.equal([{ key: 'name', value: 'Doe' }]);
  });

  it('provides reject', function () {
    const slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
      new MemberElement('name', 'Bill'),
    ]);

    const filtered = slice.reject(function (value) {
      return value.toValue() === 'Doe';
    });

    expect(filtered).to.be.instanceof(ObjectSlice);
    expect(filtered.toValue()).to.deep.equal([{ key: 'name', value: 'Bill' }]);
  });

  it('provides keys', function () {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    expect(slice.keys()).to.deep.equal(['name']);
  });

  it('provides values', function () {
    const element = new MemberElement('name', 'Doe');
    const slice = new ObjectSlice([element]);

    expect(slice.values()).to.deep.equal(['Doe']);
  });
});
