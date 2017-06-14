'use strict';

var Element = require('./element');

module.exports = Element.extend({
  constructor: function() {
    Element.apply(this, arguments);
    this.element = 'boolean';
  },

  primitive: function() {
    return 'boolean';
  }
});
