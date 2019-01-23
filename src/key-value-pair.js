'use strict';

var uptown = require('uptown');
var createClass = uptown.createClass;

/**
 * @class
 *
 * @property {Element} key
 * @property {Element} value
 */
var KeyValuePair = createClass({
  constructor: function(key, value) {
    this.key = key;
    this.value = value;
  },

  /**
   * @returns {KeyValuePair}
   * @memberof KeyValuePair
   */
  clone: function() {
    var clone = new KeyValuePair();

    if (this.key) {
      clone.key = this.key.clone();
    }

    if (this.value) {
      clone.value = this.value.clone();
    }

    return clone;
  }
});

module.exports = KeyValuePair;
