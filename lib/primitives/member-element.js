'use strict';

var KeyValuePair = require('../key-value-pair');
var refract = require('../refraction').refract;
var Element = require('./element');


/**
 * @param {Element} key
 * @param {Element} value
 * @param meta
 * @param attributes
 */
class MemberElement extends Element {
  constructor(key, value, meta, attributes) {
    key = refract(key);
    value = refract(value);
    var content = new KeyValuePair(key, value);

    super(content, meta, attributes);
    this.element = 'member';
  }

  /**
   * @type Element
   */
  get key() {
    return this.content.key;
  }

  set key(key) {
    this.content.key = refract(key);
  }

  /**
   * @type Element
   */
  get value() {
    return this.content.value;
  }

  set value (value) {
    this.content.value = refract(value);
  }
}

module.exports = MemberElement;
