'use strict';

var Element = require('../primitives/element');

/**
 * @class LinkElement
 *
 * @param content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
module.exports = Element.extend({
  constructor: function(content, meta, attributes) {
    Element.call(this, content || [], meta, attributes);
    this.element = 'link';
  }
}, {}, {
  /**
   * @type StringElement
   * @memberof LinkElement.prototype
   */
  relation: {
    get: function() {
      return this.attributes.get('relation');
    },
    set: function(relation) {
      this.attributes.set('relation', relation);
    }
  },

  /**
   * @type StringElement
   * @memberof LinkElement.prototype
   */
  href: {
    get: function() {
      return this.attributes.get('href');
    },
    set: function(href) {
      this.attributes.set('href', href);
    }
  }
});
