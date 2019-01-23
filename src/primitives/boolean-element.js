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
module.exports = Element.extend({
  constructor: function() {
    Element.apply(this, arguments);
    this.element = 'boolean';
  },

  primitive: function() {
    return 'boolean';
  }
});
