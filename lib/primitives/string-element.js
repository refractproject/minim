'use strict';

var Element = require('./element');

/**
 * @class StringElement
 *
 * @param {string} content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
class StringElement extends Element {
  constructor() {
    super(...arguments);
    this.element = 'string';
  }

  primitive() {
    return 'string';
  }

  /**
   * @type number
   * @readonly
   * @memberof StringElement.prototype
   */
  get length() {
    return this.content.length;
  }
}

module.exports = StringElement;
