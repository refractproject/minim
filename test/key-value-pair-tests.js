var _ = require('lodash');
var expect = require('./spec-helper').expect;
var BaseElement = require('../lib/minim').BaseElement;
var KeyValuePair = require('../lib/key-value-pair');

describe('KeyValuePair', function() {
  it('can be initialised with a key and value', function() {
    var key = new BaseElement('key');
    var value = new BaseElement('value');
    var pair = new KeyValuePair(key, value);

    expect(pair.key).to.equal(key);
    expect(pair.value).to.equal(value);
  });

  it('updates key parent when setting new key', function() {
    var key = new BaseElement('key');
    var newKey = new BaseElement('new key');
    var parent = new BaseElement('parent');
    var pair = new KeyValuePair(key, null);
    pair.parent = parent;

    pair.key = newKey;

    expect(key.parent).to.be.null;
    expect(newKey.parent).to.be.equal(parent);
  });

  it('updates value parent when setting new value', function() {
    var value = new BaseElement('value');
    var newValue = new BaseElement('new value');
    var parent = new BaseElement('parent');
    var pair = new KeyValuePair(null, value);
    pair.parent = parent;

    pair.value = newValue;

    expect(value.parent).to.be.null;
    expect(newValue.parent).to.be.equal(parent);
  });
});
