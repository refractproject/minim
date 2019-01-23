'use strict';

var Element = require('../primitives/element');

/**
 * @class RefElement
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
    this.element = 'ref';

    if (!this.path) {
      this.path = 'element';
    }
  }
}, {}, {
  /**
   * Path of referenced element to transclude instead of element itself.
   * @type StringElement
   * @default element
   * @memberof RefElement.prototype
   */
  path: {
    get: function() {
      return this.attributes.get('path');
    },

    set: function(newValue) {
      this.attributes.set('path', newValue);
    }
  }
});
