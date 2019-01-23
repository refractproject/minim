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
module.exports = Element.extend({
  constructor: function() {
    Element.apply(this, arguments);
    this.element = 'number';
  },

  primitive: function() {
    return 'number';
  }
});
