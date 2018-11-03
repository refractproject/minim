'use strict';

var KeyValuePair = require('../key-value-pair');
var Element = require('./element');


/**
 * @class MemberElement
 *
 * @param {Element} key
 * @param {Element} value
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
module.exports = Element.extend({
  constructor: function(key, value, meta, attributes) {
    Element.call(this, new KeyValuePair(), meta, attributes);

    this.element = 'member';
    this.key = key;
    this.value = value;
  }
}, {}, {
  /**
   * @type Element
   * @memberof MemberElement.prototype
   */
  key: {
    get: function() {
      return this.content.key;
    },
    set: function(key) {
      this.content.key = this.refract(key);
    }
  },

  /**
   * @type Element
   * @memberof MemberElement.prototype
   */
  value: {
    get: function() {
      return this.content.value;
    },
    set: function(value) {
      this.content.value = this.refract(value);
    }
  }
});
