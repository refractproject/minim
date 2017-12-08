'use strict';

var Element = require('./element');

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
  constructor() {
    super(...arguments);
    this.element = 'boolean';
  }

  primitive() {
    return 'boolean';
  }
}

module.exports = BooleanElement
