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
module.exports = Element.extend({
  constructor: function() {
    Element.apply(this, arguments);
    this.element = 'string';
  },

  primitive: function() {
    return 'string';
  }
}, {}, {
  /**
   * @type number
   * @readonly
   * @memberof StringElement.prototype
   */
  length: {
    get: function() {
      return this.content.length;
    }
  }
});
