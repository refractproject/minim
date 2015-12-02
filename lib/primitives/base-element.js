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

      this.content = content !== undefined ? content : null;

      // The following mark certain keys as being refracted when serialized
      // instead of just calling `.toValue()` on them.
      this._attributeElementKeys = registry._attributeElementKeys.concat([]);
      this._attributeElementArrayKeys = registry._attributeElementArrayKeys.concat([]);
    },

    primitive: function() {
      return;
    },

    /*
     * Creates a deep clone of the instance
     */
    clone: function() {
      return registry.fromRefract(this.toRefract());
    },

    toValue: function() {
      return this.content;
    },

    toRefract: function(options) {
      var attributes = this.convertAttributesToRefract('toRefract');
      var meta = this.convertMetaToRefract('toRefract');
      var initial = {
        element: this.element,
        meta: meta,
        attributes: attributes,
        content: this.content
      };
      return _.extend(initial, options || {});
    },

    toCompactRefract: function() {
      var attributes = this.convertAttributesToRefract('toCompactRefract');
      var meta = this.convertMetaToRefract('toCompactRefract');
      return [this.element, meta, attributes, this.content];
    },

    /*
     * Converts everything in `meta` into values, unless any top-level element
     * contains additional metadata or attributes, in which case it gets
     * refracted.
     */
    convertMetaToRefract: function(functionName) {
      var meta = {};
      this.meta.keys().forEach(function (key) {
        var item = this.meta.get(key);
        if (item.meta.keys().length || item.attributes.keys().length) {
          // Additional information, so we need to refract this element!
          meta[key] = item[functionName]();
        } else if (item.element === 'array') {
          // This is a plain array, but maybe it contains elements with
          // additional information? Let's see!
          var values = [];
          for (var index = 0; index < item.length; index++) {
            var subItem = item.get(index);
            if (subItem.meta.keys().length || subItem.attributes.keys().length) {
              values.push(subItem[functionName]());
            } else {
              values.push(subItem);
            }
          }
          meta[key] = values;
        } else {
          meta[key] = item.toValue();
        }
      }, this);
      return meta;
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
        } else if (this._attributeElementArrayKeys.indexOf(key) !== -1) {
          attributes[key] = [];
          var items = this.attributes.get(key);
          for (var j = 0; j < items.length; j++) {
            attributes[key].push(items.get(j)[functionName]());
          }
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
      var i, key;

      for (i = 0; i < this._attributeElementKeys.length; i++) {
        key = this._attributeElementKeys[i];

        if (this.attributes.hasKey(key)) {
          this.attributes.set(key, conversionFunc(this.attributes.get(key).toValue()));
        }
      }

      for (i = 0; i < this._attributeElementArrayKeys.length; i++) {
        key = this._attributeElementArrayKeys[i];

        if (this.attributes.hasKey(key)) {
          var items = this.attributes.get(key);
          var converted = [];

          for (var j = 0; j < items.length; j++) {
            converted.push(conversionFunc(items.get(j).toValue()));
          }

          this.attributes.set(key, converted);
        }
      }
    },

    fromRefract: function(doc) {
      this.attributes = doc.attributes;
      this.content = doc.content;

      if (doc.meta) {
        traverseMeta(doc.meta, this, function(item) {
          return _.get(item, 'element');
        }, function(item) {
          return registry.fromRefract(item);
        });
      }

      this.convertAttributesToElements(function(attribute) {
        return registry.fromRefract(attribute);
      });

      if (this.element !== doc.element) {
        this.element = doc.element;
      }

      return this;
    },

    fromCompactRefract: function(tuple) {
      this.attributes = tuple[2];
      this.content = tuple[3];

      if (tuple[1]) {
        traverseMeta(tuple[1], this, function(item) {
          return item && item.length === 4 && _.isString(item[0]) && _.isObject(item[1]) && _.isObject(item[2]);
        }, function(item) {
          return registry.fromCompactRefract(item);
        });
      }

      this.convertAttributesToElements(function(attribute) {
        return registry.fromCompactRefract(attribute);
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
        return this.getMetaProperty('id', '').toValue();
      },
      set: function(element) {
        this.setMetaProperty('id', element);
      }
    },

    classes: {
      get: function() {
        return this.getMetaProperty('classes', []);
      },
      set: function(element) {
        this.setMetaProperty('classes', element);
      }
    },

    // TODO: Remove, not in Refract spec
    // Requires updating subclass test
    name: {
      get: function() {
        return this.getMetaProperty('name', '').toValue();
      },
      set: function(element) {
        this.setMetaProperty('name', element);
      }
    },

    title: {
      get: function() {
        return this.getMetaProperty('title', '').toValue();
      },
      set: function(element) {
        this.setMetaProperty('title', element);
      }
    },

    description: {
      get: function() {
        return this.getMetaProperty('description', '').toValue();
      },
      set: function(element) {
        this.setMetaProperty('description', element);
      }
    },

    links: {
      get: function() {
        return this.getMetaProperty('links', []);
      },
      set: function(element) {
        this.setMetaProperty('links', element);
      }
    }
  });

  //-----------------------------------------------------------------------------
  // Private Helpers

  function traverseMeta(meta, el, test, convert) {
    // We know meta is an object, so we can skip the checks
    traverseObject(meta, el.meta, test, convert);
  }

  function traverseObject(obj, el, test, convert) {
    var ArrayElement = registry.getElementClass('array');

    Object.keys(obj).forEach(function (key) {
      var value = obj[key];

      // TODO: Warning - this may raise a false positive :-(
      // Also, this does not implement nested objects with nested Refract Objects
      // In the future, we may need to support that, but currently, it's not needed.
      if (test(value)) {
        el.set(key, convert(value));
      } else if (_.isArray(value)) {
        var newArray = new ArrayElement();
        traverseArray(value, newArray, test, convert);
        el.set(key, newArray);
      } else {
        el.set(key, value);
      }
    });
  }

  function traverseArray(value, el, test, convert) {
    value.forEach(function(item) {
      if (test(item)) {
        el.push(convert(item));
      } else {
        el.push(item);
      }
    });
  }
};
