'use strict';

const Element = require('./element');

/**
 * @class NumberElement
 *
 * @param {number} content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
class NumberElement extends Element {
  constructor(content, meta, attributes) {
    super(content, meta, attributes);
    this.element = 'number';
  }

  primitive() {
    return 'number';
  }
}

module.exports = NumberElement;
