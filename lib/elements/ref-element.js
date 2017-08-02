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
   * @type StringElement
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
