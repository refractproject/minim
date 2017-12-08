'use strict';

var Element = require('./element');

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
  constructor(...args) {
    super(...args);
    this.element = 'number';
  }

  primitive() {
    return 'number';
  }
}

module.exports = NumberElement;
