'use strict';

const Element = require('./element');

/**
 * @class BooleanElement
 *
 * @param {boolean} content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
class BooleanElement extends Element {
  constructor(content, meta, attributes) {
    super(content, meta, attributes);
    this.element = 'boolean';
  }

  primitive() {
    return 'boolean';
  }
}

module.exports = BooleanElement;
