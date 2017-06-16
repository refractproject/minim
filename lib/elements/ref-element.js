'use strict';

var Element = require('../primitives/element');

module.exports = Element.extend({
  constructor: function(content, meta, attributes) {
    Element.call(this, content || [], meta, attributes);
    this.element = 'ref';

    if (!this.path) {
      this.path = 'element';
    }
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
