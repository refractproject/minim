'use strict';

var isEqual = require('lodash/isEqual');
var uptown = require('uptown');
var createClass = uptown.createClass;
var KeyValuePair = require('../key-value-pair');
var ArraySlice = require('../array-slice.js');

/**
 * @class
 *
 * @param content
 * @param meta
 * @param attributes
 *
 * @property {string} element
 */
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

    this.content = content;
  },

  /**
   * Freezes the element to prevent any mutation.
   * A frozen element will add `parent` property to every child element
   * to allow traversing up the element tree.
   *
   * @memberof Element.prototype
   */
  freeze: function() {
    if (this._meta) {
      this.meta.parent = this;
      this.meta.freeze();
    }

    if (this._attributes) {
      this.attributes.parent = this;
      this.attributes.freeze();
    }

    this.children.forEach(function (element) {
      element.parent = this;
      element.freeze();
    }, this);

    if (this.content && Array.isArray(this.content)) {
      Object.freeze(this.content);
    }

    Object.freeze(this);
  },

  primitive: function() {
    return;
  },

  /**
   * Creates a deep clone of the instance
   * @memberof Element.prototype
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

  /**
   * @memberof Element.prototype
   */
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

  /**
   * Creates a reference pointing at the Element
   * @returns {RefElement}
   * @memberof Element.prototype
   */
  toRef: function(path) {
    if (this.id.toValue() === '') {
      throw Error('Cannot create reference to an element that does not contain an ID');
    }

    var ref = new this.RefElement(this.id.toValue());

    if (path) {
      ref.path = path;
    }

    return ref;
  },

  /**
   * Finds the given elements in the element tree.
   * When providing multiple element names, you must first freeze the element.
   *
   * @param names {...elementNames}
   * @returns {ArraySlice}
   * @memberof Element.prototype
   */
  findRecursive: function() {
    if (arguments.length > 1 && !this.isFrozen) {
      throw new Error('Cannot find recursive with multiple element names without first freezing the element. Call `element.freeze()`');
    }

    var elementNames = [].concat.apply([], arguments);
    var elementName = elementNames.pop();
    var elements = new ArraySlice();

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

      if (element.content instanceof KeyValuePair) {
        if (element.content.key) {
          checkElement(array, element.content.key);
        }

        if (element.content.value) {
          checkElement(array, element.content.value);
        }
      }

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
            parentElements = parentElements.splice(0, index);
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
    return isEqual(this.toValue(), value);
  },

  getMetaProperty: function(name, value) {
    if (!this.meta.hasKey(name)) {
      if (this.isFrozen) {
        var element = this.refract(value);
        element.freeze();
        return element;
      }

      this.meta.set(name, value);
    }

    return this.meta.get(name);
  },

  setMetaProperty: function(name, value) {
    this.meta.set(name, value);
  }
}, {}, {
  /**
   * @type String
   * @memberof Element.prototype
   */
  element: {
    get: function() {
      // Returns 'element' so we don't have undefined as element
      return this._storedElement || 'element';
    },
    set: function(element) {
      this._storedElement = element;
    }
  },

  content: {
    get: function () {
      return this._content;
    },
    set: function (value) {
      if (value instanceof Element) {
        this._content = value;
      } else if (
        typeof value == 'string' ||
        typeof value == 'number' ||
        typeof value == 'boolean' ||
        typeof value == 'null' ||
        value == undefined
      ) {
        // Primitive Values
        this._content = value;
      } else if (value instanceof KeyValuePair) {
        this._content = value;
      } else if (Array.isArray(value)) {
        this._content = value.map(this.refract);
      } else if (typeof value === 'object') {
        this._content = Object.keys(value).map(function(key) {
          return new this.MemberElement(key, value[key]);
        }, this);
      } else {
        throw new Error('Cannot set content to given value');
      }
    }
  },

  /**
   * @type this.ObjectElement
   * @memberof Element.prototype
   */
  meta: {
    get: function() {
      if (!this._meta) {
        if (this.isFrozen) {
          var meta = new this.ObjectElement();
          meta.freeze();
          return meta;
        }

        this._meta = new this.ObjectElement();
      }

      return this._meta;
    },
    set: function(value) {
      if (value instanceof this.ObjectElement) {
        this._meta = value;
      } else {
        this.meta.set(value || {});
      }
    }
  },

  /**
   * The attributes property defines attributes about the given instance
   * of the element, as specified by the element property.
   *
   * @type this.ObjectElement
   * @memberof Element.prototype
   */
  attributes: {
    get: function() {
      if (!this._attributes) {
        if (this.isFrozen) {
          var meta = new this.ObjectElement();
          meta.freeze();
          return meta;
        }

        this._attributes = new this.ObjectElement();
      }

      return this._attributes;
    },
    set: function(value) {
      if (value instanceof this.ObjectElement) {
        this._attributes = value;
      } else {
        this.attributes.set(value || {});
      }
    }
  },

  /**
   * Unique Identifier, MUST be unique throughout an entire element tree.
   * @type StringElement
   * @memberof Element.prototype
   */
  id: {
    get: function() {
      return this.getMetaProperty('id', '');
    },
    set: function(element) {
      this.setMetaProperty('id', element);
    }
  },

  /**
   * @type ArrayElement
   * @memberof Element.prototype
   */
  classes: {
    get: function() {
      return this.getMetaProperty('classes', []);
    },
    set: function(element) {
      this.setMetaProperty('classes', element);
    }
  },

  /**
   * Human-readable title of element
   * @type StringElement
   * @memberof Element.prototype
   */
  title: {
    get: function() {
      return this.getMetaProperty('title', '');
    },
    set: function(element) {
      this.setMetaProperty('title', element);
    }
  },

  /**
   * Human-readable description of element
   * @type StringElement
   * @memberof Element.prototype
   */
  description: {
    get: function() {
      return this.getMetaProperty('description', '');
    },
    set: function(element) {
      this.setMetaProperty('description', element);
    }
  },

  /**
   * @type ArrayElement
   * @memberof Element.prototype
   */
  links: {
    get: function() {
      return this.getMetaProperty('links', []);
    },
    set: function(element) {
      this.setMetaProperty('links', element);
    }
  },

  /**
   * Returns whether the element is frozen.
   * @type boolean
   * @readonly
   * @memberof Element.prototype
   * @see freeze
   */
  isFrozen: {
    get: function() {
      return Object.isFrozen(this);
    }
  },

  /**
   * Returns all of the parent elements.
   * @type ArraySlice
   * @readonly
   * @memberof Element.prototype
   * @see freeze
   */
  parents: {
    get: function() {
      var parent = this.parent;
      var parents = new ArraySlice();

      while (parent) {
        parents.push(parent);
        parent = parent.parent;
      }

      return parents;
    }
  },

  /**
   * Returns all of the children elements found within the element.
   * @type ArraySlice
   * @readonly
   * @memberof Element.prototype
   * @see recursiveChildren
   */
  children: {
    get: function() {
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

  /**
   * Returns all of the children elements found within the element recursively.
   * @type ArraySlice
   * @readonly
   * @memberof Element.prototype
   * @see children
   */
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
