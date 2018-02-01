'use strict';

var Element = require('../primitives/element');

/** Hyperlinking MAY be used to link to other resources, provide links to
 * instructions on how to process a given element (by way of a profile or
 * other means), and may be used to provide meta data about the element in
 * which it's found. The meaning and purpose of the hyperlink is defined by
 * the link relation according to RFC 5988.
 *
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
   * The relation identifier for the link, as defined in RFC 5988.
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
   * The URI for the given link.
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
