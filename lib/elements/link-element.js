'use strict';

module.exports = function(BaseElement) {
  return BaseElement.extend({
    constructor: function(content, meta, attributes) {
      BaseElement.call(this, content || [], meta, attributes);
      this.element = 'link';
    }
  }, {}, {
    relation: {
      get: function() {
        return this.attributes.get('relation').toValue();
      },
      set: function(relation) {
        this.attributes.set('relation', relation);
      }
    },

    href: {
      get: function() {
        return this.attributes.get('href').toValue();
      },
      set: function(href) {
        this.attributes.set('href', href);
      }
    }
  });
};
