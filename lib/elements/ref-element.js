'use strict';

var BaseElement = require('../primitives/base-element');

module.exports = BaseElement.extend({
  constructor: function(content, meta, attributes) {
    BaseElement.call(this, content || [], meta, attributes);
    this.element = 'ref';
  }
}, {}, {
  path: {
    get: function() {
      return this.attributes.get('path');
    },

    set: function(newValue) {
      this.attributes.set('path', newValue);
    }
  }
});
