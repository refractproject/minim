var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');
var MemberElement = minim.MemberElement;
var ObjectSlice = minim.ObjectSlice;

describe('ObjectSlice', function () {
  it('provides map', function () {
    var slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
    ]);

    var result = slice.map(function (value) {
      return value.toValue();
    });

    expect(result).to.deep.equal(['Doe']);
  });

  it('provides forEach', function () {
    var element = new MemberElement('name', 'Doe');
    var slice = new ObjectSlice([element]);

    var keys = [];
    var values = [];
    var members = [];
    var indexes = [];

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
    var slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
      new MemberElement('name', 'Bill'),
    ]);

    var filtered = slice.filter(function (value) {
      return value.toValue() === 'Doe';
    });

    expect(filtered).to.be.instanceof(ObjectSlice);
    expect(filtered.toValue()).to.deep.equal([{key: 'name', value: 'Doe'}]);
  });

  it('provides reject', function () {
    var slice = new ObjectSlice([
      new MemberElement('name', 'Doe'),
      new MemberElement('name', 'Bill'),
    ]);

    var filtered = slice.reject(function (value) {
      return value.toValue() === 'Doe';
    });

    expect(filtered).to.be.instanceof(ObjectSlice);
    expect(filtered.toValue()).to.deep.equal([{key: 'name', value: 'Bill'}]);
  });

  it('provides keys', function () {
    var element = new MemberElement('name', 'Doe');
    var slice = new ObjectSlice([element]);

    expect(slice.keys()).to.deep.equal(['name']);
  });

  it('provides values', function () {
    var element = new MemberElement('name', 'Doe');
    var slice = new ObjectSlice([element]);

    expect(slice.values()).to.deep.equal(['Doe']);
  });
});
