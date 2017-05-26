'use strict';

var KeyValuePair = require('../key-value-pair');


module.exports = function(BaseElement, registry) {
  return BaseElement.extend({
    constructor: function(key, value, meta, attributes) {
      key = registry.toElement(key);
      value = registry.toElement(value);
      var content = new KeyValuePair(key, value);

      BaseElement.call(this, content, meta, attributes);
      this.element = 'member';
    },
  }, {}, {
    key: {
      get: function() {
        return this.content.key;
      },
      set: function(key) {
        this.content.key = registry.toElement(key);
      }
    },

    value: {
      get: function() {
        return this.content.value;
      },
      set: function(value) {
        this.content.value = registry.toElement(value);
      }
    }
  });
};
