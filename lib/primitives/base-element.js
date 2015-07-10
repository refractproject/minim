'use strict';

var _ = require('lodash');
var uptown = require('uptown');
var createClass = uptown.createClass;

module.exports = function(registry) {
  return createClass({
    constructor: function(content, meta, attributes) {
      // Lazy load this.meta and this.attributes because it's a Minim element
      // Otherwise, we get into circuluar calls
      if (meta) {
        this.meta.set(meta);
      }

      if (attributes) {
        this.attributes.set(attributes);
      }

      this.content = content || null;
      this._attributeElementKeys = [];
    },

    primitive: function() {
      return;
    },

    toValue: function() {
      return this.content;
    },

    toRefract: function(options) {
      var attributes = this.convertAttributesToRefract('toRefract');
      var initial = {
        element: this.element,
        meta: this.meta.toValue(),
        attributes: attributes,
        content: this.content
      };
      return _.extend(initial, options || {});
    },

    toCompactRefract: function() {
      var attributes = this.convertAttributesToRefract('toCompactRefract');
      return [this.element, this.meta.toValue(), attributes, this.content];
    },

    /*
     * Some attributes may be elements. This is domain-specific knowledge, so
     * a subclass *MUST* define the attribute element names to convert. This
     * method handles the actual serialization to refract.
     */
    convertAttributesToRefract: function(functionName) {
      var attributes = {};
      var keys = this.attributes.keys();

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (this._attributeElementKeys.indexOf(key) !== -1) {
          attributes[key] = this.attributes.get(key)[functionName]();
        } else {
          attributes[key] = this.attributes.get(key).toValue();
        }
      }

      return attributes;
    },

    /*
     * Some attributes may be elements. This is domain-specific knowledge, so
     * a subclass *MUST* define the attribute element names to convert. This
     * method handles the actual conversion when loading.
     */
    convertAttributesToElements: function(conversionFunc) {
      for (var i = 0; i < this._attributeElementKeys.length; i++) {
        var key = this._attributeElementKeys[i];

        if (this.attributes.hasKey(key)) {
          this.attributes.set(key, conversionFunc(this.attributes.get(key).toValue()));
        }
      }
    },

    fromRefract: function(doc) {
      this.meta = doc.meta;
      this.attributes = doc.attributes;
      this.content = doc.content;

      this.convertAttributesToElements(function(attribute) {
        return registry.fromRefract(attribute);
      });

      if (this.element !== doc.element) {
        this.element = doc.element;
      }

      return this;
    },

    fromCompactRefract: function(tuple) {
      this.meta = tuple[1];
      this.attributes = tuple[2];
      this.content = tuple[3];

      this.convertAttributesToElements(function(attribute) {
        registry.fromCompactRefract(attribute);
      });

      if (this.element !== tuple[0]) {
        this.element = tuple[0];
      }

      return this;
    },

    set: function(content) {
      this.content = content;
      return this;
    },

    equals: function(value) {
      return _.isEqual(this.toValue(), value);
    },

    getMetaProperty: function(name, value) {
      if (!this.meta.hasKey(name)) {
        this.meta.set(name, value);
      }

      return this.meta.get(name);
    },

    setMetaProperty: function(name, value) {
      this.meta.set(name, value);
    },

    toRef: function() {
      var RefElement = registry.getElementClass('ref');
      var ref = new RefElement(this.id.toValue());
      ref.instance = this;
      return ref;
    }
  }, {}, {
    element: {
      get: function() {
        // Returns 'element' so we don't have undefined as element
        return this._storedElement || 'element';
      },
      set: function(element) {
        this._storedElement = element;
      }
    },

    meta: {
      get: function() {
        if (!this._meta) {
          this._meta = registry.toElement({});
        }

        return this._meta;
      },
      set: function(value) {
        this.meta.set(value || {});
      }
    },

    attributes: {
      get: function() {
        if (!this._attributes) {
          this._attributes = registry.toElement({});
        }

        return this._attributes;
      },
      set: function(value) {
        this.attributes.set(value || {});
      }
    },

    id: {
      get: function() {
        return this.getMetaProperty('id', '');
      },
      set: function(element) {
        this.setMetaProperty('id', element);
      }
    },

    class: {
      get: function() {
        return this.getMetaProperty('class', []);
      },
      set: function(element) {
        this.setMetaProperty('class', element);
      }
    },

    // TODO: Remove, not in Refract spec
    // Requires updating subclass test
    name: {
      get: function() {
        return this.getMetaProperty('name', '');
      },
      set: function(element) {
        this.setMetaProperty('name', element);
      }
    },

    title: {
      get: function() {
        return this.getMetaProperty('title', '');
      },
      set: function(element) {
        this.setMetaProperty('title', element);
      }
    },

    description: {
      get: function() {
        return this.getMetaProperty('description', '');
      },
      set: function(element) {
        this.setMetaProperty('description', element);
      }
    }
  });
};
