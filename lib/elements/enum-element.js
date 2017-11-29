'use strict';

var refract = require('../refraction').refract;
var Element = require('../primitives/element');
var ArrayElement = require('../primitives/array-element');

/**
 * @class EnumElement
 *
 * @param content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
module.exports = Element.extend({
  constructor: function(content, meta, attributes) {
    Element.call(this, refract(content), meta, attributes);
    this.element = 'enum';
  }
}, {}, {
  /**
   * @type ArrayElement
   * @memberof EnumElement.prototype
   */
  enumerations: {
    get: function() {
      return this.attributes.get('enumerations');
    },
    set: function(values) {
      var enumerations;

      if (values instanceof ArrayElement) {
        enumerations = values;
      } else if (Array.isArray(values)) {
        enumerations = new ArrayElement(values);
      } else {
        enumerations = new ArrayElement();
      }

      this.attributes.set('enumerations', enumerations);
    }
  },
});
