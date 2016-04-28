'use strict';

module.exports = function(BaseElement, registry) {
  return BaseElement.extend({
    constructor: function(key, value, meta, attributes) {
      var content = {
        key: registry.toElement(key),
        value: registry.toElement(value)
      };

      BaseElement.call(this, content, meta, attributes);
      this.element = 'member';
    },

    toValue: function () {
      return {
        key: this.key.toValue(),
        value: this.value.toValue()
      };
    },

    toRefract: function() {
      return BaseElement.prototype.toRefract.call(this, {
        content: {
          key: this.key.toRefract(),
          value: this.value.toRefract()
        }
      });
    },

    fromRefract: function(doc) {
      return BaseElement.prototype.fromRefract.call(this, doc, {
        content: {
          key: registry.fromRefract(doc.content.key),
          value: registry.fromRefract(doc.content.value)
        }
      });
    }
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
