'use strict';

var _ = require('lodash');
var uptown = require('uptown');
var createClass = uptown.createClass;
var KeyValuePair = require('../key-value-pair');
var ArraySlice = require('../array-slice.js');

var Element = createClass({
  constructor: function(content, meta, attributes) {
    // Lazy load this.meta and this.attributes because it's a Minim element
    // Otherwise, we get into circuluar calls
    if (meta) {
      this.meta = meta;
    }

    if (attributes) {
      this.attributes = attributes;
    }

    this.content = content !== undefined ? content : null;
    this.parent = null;
  },

  primitive: function() {
    return;
  },

  /*
   * Creates a deep clone of the instance
   */
  clone: function() {
    var copy = new this.constructor();

    copy.element = this.element;

    if (this.meta.length) {
      copy._meta = this.meta.clone();
    }

    if (this.attributes.length) {
      copy._attributes = this.attributes.clone();
    }

    if (this.content) {
      if (this.content.clone) {
        copy.content = this.content.clone();
      } else if (Array.isArray(this.content)) {
        copy.content = this.content.map(function (element) {
          return element.clone();
        });
      } else {
        copy.content = this.content;
      }
    } else {
      copy.content = this.content;
    }

    return copy;
  },

  toValue: function() {
    if (this.content instanceof Element) {
      return this.content.toValue();
    }

    if (this.content instanceof KeyValuePair) {
      return {
        key: this.content.key.toValue(),
        value: this.content.value.toValue()
      };
    }

    if (this.content && this.content.map) {
      return this.content.map(function(element) {
        return element.toValue();
      }, this);
    }

    return this.content;
  },

  toRef: function(path) {
    if (this.id.toValue() === '') {
      throw Error('Cannot create reference to an element that does not contain an ID');
    }

    var RefElement = require('../elements/ref-element');
    var ref = new RefElement(this.id.toValue());

    if (path) {
      ref.path = path;
    }

    return ref;
  },

  /// Finds the given elements in the element tree
  /// Returns ArraySlice of elements
  /// findRecursive: function(names..., parents)
  findRecursive: function() {
    var ArrayElement = require('./array-element');
    var elementNames = [].concat.apply([], arguments);
    var elements = new ArraySlice();
    var parents;

    if (elementNames[elementNames.length - 1] instanceof ArraySlice) {
      // clone the given parents
      parents = new ArraySlice(elementNames.pop().map(function (e) { return e; }));
    } else {
      parents = new ArraySlice();
    }

    var elementName = elementNames.pop();

    parents.unshift(this);

    var append = function(array, element) {
      array.push(element);
      return array;
    };

    var attachParents = function(element, parents) {
      var clonedElement = element.clone();
      clonedElement.parents = parents;
      return clonedElement;
    };

    // Checks the given element and appends element/sub-elements
    // that match element name to given array
    var checkElement = function(array, element) {
      if (element.element === elementName) {
        array.push(attachParents(element, parents));
      }

      var items = element.findRecursive(elementName, parents);
      if (items) {
        items.reduce(append, array);
      }

      parents.unshift(element);

      if (element.content instanceof KeyValuePair) {
        if (element.content.key) {
          checkElement(array, element.content.key);
        }

        if (element.content.value) {
          checkElement(array, element.content.value);
        }
      }

      parents.shift();

      return array;
    };

    if (this.content) {
      // Direct Element
      if (this.content.element) {
        checkElement(elements, this.content);
      }

      // Element Array
      if (Array.isArray(this.content)) {
        this.content.reduce(checkElement, elements);
      }
    }

    if (!elementNames.isEmpty) {
      elements = elements.filter(function (element) {
        var parentElements = element.parents.map(function (element) {
          return element.element;
        });

        for (var namesIndex in elementNames) {
          var name = elementNames[namesIndex];
          var index = parentElements.indexOf(name);

          if (index !== -1) {
            parentElements.splice(0, index);
          } else {
            return false;
          }
        }

        return true;
      });
    }

    return elements;
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
        var ObjectElement = require('./object-element');
        this._meta = new ObjectElement();
      }

      return this._meta;
    },
    set: function(value) {
      var ObjectElement = require('./object-element');

      if (value instanceof ObjectElement) {
        this._meta = value;
      } else {
        this.meta.set(value || {});
      }
    }
  },

  content: {
    get: function() {
      return this._content;
    },

    set: function(newValue) {
      if (this._content instanceof Element || this._content instanceof KeyValuePair) {
        this._content.parent = null;
      } else if (Array.isArray(this._content)) {
        this._content.forEach(function (value) {
          value.parent = null;
        }, this);
      }

      this._content = newValue;

      if (newValue instanceof Element || newValue instanceof KeyValuePair) {
        newValue.parent = this;
      } else if (Array.isArray(newValue)) {
        newValue.forEach(function (value) {
          value.parent = this;
        }, this);
      }
    }
  },

  parent: {
    get: function() {
      return this._parent;
    },

    set: function(newValue) {
      if (newValue && this._parent) {
        throw new Error('Cannot set a new parent, element already has parent');
      }

      this._parent = newValue;
    }
  },

  attributes: {
    get: function() {
      if (!this._attributes) {
        var ObjectElement = require('./object-element');
        this._attributes = new ObjectElement();
      }

      return this._attributes;
    },
    set: function(value) {
      var ObjectElement = require('./object-element');
      if (value instanceof ObjectElement) {
        this._attributes = value;
      } else {
        this.attributes.set(value || {});
      }
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
  },

  children: {
    get: function() {
      var ArrayElement = require('./array-element');

      if (Array.isArray(this.content)) {
        return new ArraySlice(this.content);
      } else if (this.content instanceof KeyValuePair) {
        var children = new ArraySlice([this.content.key]);

        if (this.content.value) {
          children.push(this.content.value);
        }

        return children;
      } else if (this.content instanceof Element) {
        return new ArraySlice([this.content]);
      } else {
        return new ArraySlice();
      }
    }
  },

  recursiveChildren: {
    get: function() {
      var children = new ArraySlice();

      this.children.forEach(function (element) {
        children.push(element);

        element.recursiveChildren.forEach(function (child) {
          children.push(child);
        });
      });

      return children;
    }
  }
});

module.exports = Element;
