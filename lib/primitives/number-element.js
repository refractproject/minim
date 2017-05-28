'use strict';

var BaseElement = require('./base-element');

module.exports = BaseElement.extend({
  constructor: function() {
    BaseElement.apply(this, arguments);
    this.element = 'number';
  },

  primitive: function() {
    return 'number';
  }
});
