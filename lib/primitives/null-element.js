'use strict';

var Element = require('./element');

/**
 * @class NullElement
 * @extends Element
 */
module.exports = Element.extend({
  constructor: function() {
    Element.apply(this, arguments);
    this.element = 'null';
  },

  primitive: function() {
    return 'null';
  },

  set: function() {
    return new Error('Cannot set the value of null');
  }
});
