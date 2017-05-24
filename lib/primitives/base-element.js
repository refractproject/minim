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

    /// Finds the given elements in the element tree
    /// Returns ArrayElement of elements
    /// findRecursive: function(names...)
    findRecursive: function() {
      var elementNames = [].concat.apply([], arguments);
      var array = [];

      var elementName = elementNames.pop();

      var append = function(array, element) {
        array.push(element);
        return array;
      };

      // Checks the given element and appends element/sub-elements
      // that match element name to given array
      var checkElement = function(array, element) {
        if (element.element === elementName) {
          array.push(element);
        }

        var items = element.findRecursive(elementName);
        if (items) {
          items.reduce(append, array);
        }

        // Key-Value Pair
        if (element.key) {
          checkElement(array, element.key);
        }

        if (element.value) {
          checkElement(array, element.value);
        }

        return array;
      };

      if (this.content) {
        // Direct Element
        if (this.content.element) {
          checkElement(array, this.content);
        }

        // Element Array
        if (Array.isArray(this.content)) {
          this.content.reduce(checkElement, array);
        }
      }

      if (!elementNames.isEmpty) {
        array = array.filter(function (element) {
          var parentElements = element.parents.map(function (element) {
            return element.element;
          });

          for (var namesIndex in elementNames) {
            var name = elementNames[namesIndex];
            var index = parentElements.indexOf(name);

            if (index !== -1) {
              parentElements = parentElements.splice(0, index);
            } else {
              return false;
            }
          }

          return true;
        });
      }

      return array;
    },

    shouldRefract: function (element) {
      if (element.element !== element.primitive() || element.element === 'member') {
        return true;
      }

      if (element.attributes.keys().length || element.meta.keys().length) {
        return true;
      }

      return false;
    },

    toRefract: function(options) {
      var attributes = this.convertAttributesToRefract();
      var meta = this.convertMetaToRefract();
      var initial = {
        element: this.element,
        meta: meta,
        attributes: attributes,
        content: this.content
      };
      return _.extend(initial, options || {});
    },

    convertKeyToRefract: function (key, item) {
      if (this.shouldRefract(item)) {
        return item.toRefract();
      }

      if (item.element === 'array') {
        // This is a plain array, but maybe it contains elements with
        // additional information? Let's see!
        var values = [];

        for (var index = 0; index < item.length; index++) {
          var subItem = item.get(index);

          if (this.shouldRefract(subItem)) {
            values.push(subItem.toRefract());
          } else {
            values.push(subItem.toValue());
          }
        }

        return values;
      }

      if (item.element === 'object') {
        // This is an object, so we need to check if it's members contain
        // additional information
        // TODO
      }

      return item.toValue();
    },

    /*
     * Converts everything in `meta` into values
     */
    convertMetaToRefract: function() {
      var meta = {};

      this.meta.keys().forEach(function (key) {
        meta[key] = this.convertKeyToRefract(key, this.meta.get(key));
      }, this);

      return meta;
    },

    /*
     * Some attributes may be elements.
     */
    convertAttributesToRefract: function() {
      var attributes = {};

      this.attributes.keys().forEach(function (key) {
        attributes[key] = this.convertKeyToRefract(key, this.attributes.get(key));
      }, this);

      return attributes;
    },

    fromRefract: function(doc, options) {
      this.content = doc.content;

      if (doc.attributes) {
        traverseObject(doc.attributes, this.attributes, function (item) {
          return _.get(item, 'element');
        }, function (item) {
          return registry.fromRefract(item);
        });
      }

      if (doc.meta) {
        traverseObject(doc.meta, this.meta, function(item) {
          return _.get(item, 'element');
        }, function(item) {
          return registry.fromRefract(item);
        });
      }

      if (this.element !== doc.element) {
        this.element = doc.element;
      }

      return _.extend(this, options || {});
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
    parents: {
      get: function() {
        var parents = [];

        var parent = this.parent;
        while (parent) {
          parents.push(parent);
          parent = parent.parent;
        }

        return parents;
      }
    },

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

    classes: {
      get: function() {
        return this.getMetaProperty('classes', []);
      },
      set: function(element) {
        this.setMetaProperty('classes', element);
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
