'use strict';

var KeyValuePair = require('../key-value-pair');
var refract = require('../refraction').refract;
var BaseElement = require('./base-element');


module.exports = BaseElement.extend({
  constructor: function(key, value, meta, attributes) {
    key = refract(key);
    value = refract(value);
    var content = new KeyValuePair(key, value);

    BaseElement.call(this, content, meta, attributes);
    this.element = 'member';
  }
}, {}, {
  key: {
    get: function() {
      return this.content.key;
    },
    set: function(key) {
      this.content.key = refract(key);
    }
  },

  value: {
    get: function() {
      return this.content.value;
    },
    set: function(value) {
      this.content.value = refract(value);
    }
  }
});
