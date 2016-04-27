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
      return {
        element: this.element,
        meta: this.meta.toValue(),
        attributes: this.attributes.toValue(),
        content: {
          key: this.key.toRefract(),
          value: this.value.toRefract()
        }
      };
    },

    fromRefract: function(doc) {
      this.meta = doc.meta;
      this.attributes = doc.attributes;
      this.content = {
        key: registry.fromRefract(doc.content.key),
        value: registry.fromRefract(doc.content.value)
      };

      this.convertAttributesToElements(function(attribute) {
        return registry.fromRefract(attribute);
      });

      if (this.element !== doc.element) {
        this.element = doc.element;
      }

      return this;
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
