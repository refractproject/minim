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

      if (content.key) {
        content.key.parent = this;
      }

      if (content.value) {
        content.value.parent = this;
      }
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
        if (this.content.key) {
          this.content.key.parent = undefined;
        }

        this.content.key = registry.toElement(key);
        this.content.key.parent = this;
      }
    },

    value: {
      get: function() {
        return this.content.value;
      },
      set: function(value) {
        if (this.content.value) {
          this.content.value.parent = undefined;
        }

        this.content.value = registry.toElement(value);
        this.content.value.parent = this;
      }
    }
  });
};
