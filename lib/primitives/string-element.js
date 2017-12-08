'use strict';

var Element = require('./element');

/**
 * @class StringElement
 *
 * @param {string} content
 * @param meta
 * @param attributes
 */
class StringElement extends Element {
  constructor(content, meta, attributes) {
    super(content, meta, attributes);
    this.element = 'string';
  }

  primitive() {
    return 'string';
  }

  /**
   * @type number
   * @readonly
   */
  get length() {
    return this.content.length;
  }
}

module.exports = StringElement;
