'use strict';

var BaseElement = require('./base-element');

module.exports = BaseElement.extend({
  constructor: function() {
    BaseElement.apply(this, arguments);
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
