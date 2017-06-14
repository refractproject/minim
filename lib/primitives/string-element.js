'use strict';

var Element = require('./element');

module.exports = Element.extend({
  constructor: function() {
    Element.apply(this, arguments);
    this.element = 'string';
  },

  primitive: function() {
    return 'string';
  }
}, {}, {
  length: {
    get: function() {
      return this.content.length;
    }
  }
});
