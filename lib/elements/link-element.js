'use strict';

var Element = require('../primitives/element');

module.exports = Element.extend({
  constructor: function(content, meta, attributes) {
    Element.call(this, content || [], meta, attributes);
    this.element = 'link';
  }
}, {}, {
  relation: {
    get: function() {
      return this.attributes.get('relation');
    },
    set: function(relation) {
      this.attributes.set('relation', relation);
    }
  },

  href: {
    get: function() {
      return this.attributes.get('href');
    },
    set: function(href) {
      this.attributes.set('href', href);
    }
  }
});
