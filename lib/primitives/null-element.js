'use strict';

var BaseElement = require('./base-element');

module.exports = BaseElement.extend({
  constructor: function() {
    BaseElement.apply(this, arguments);
    this.element = 'null';
  },

  primitive: function() {
    return 'null';
  },

  set: function() {
    return new Error('Cannot set the value of null');
  }
});
