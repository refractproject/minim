'use strict';

const KeyValuePair = require('../key-value-pair');
const refract = require('../refraction').refract;
const Element = require('./element');


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
    const content = new KeyValuePair(key, value);

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
