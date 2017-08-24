'use strict';

var _ = require('lodash');
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

    this.content = content !== undefined ? content : null;
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

    var RefElement = require('../elements/ref-element');
    var ref = new RefElement(this.id.toValue());

    if (path) {
      ref.path = path;
    }

    return ref;
  },

  /**
   * Finds the given elements in the element tree.
   * When providing multiple element names, you must first freeze the element.
   *
   * @param {...elementNames}
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
    return _.isEqual(this.toValue(), value);
  },

  getMetaProperty: function(name, value) {
    if (!this.meta.hasKey(name)) {
      if (this.isFrozen) {
        var refract = require('../refraction').refract;
        var element = refract(value);
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

  /**
   * @type ObjectElement
   * @memberof Element.prototype
   */
  meta: {
    get: function() {
      if (!this._meta) {
        var ObjectElement = require('./object-element');

        if (this.isFrozen) {
          var meta = new ObjectElement();
          meta.freeze();
          return meta;
        }

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

  /**
   * @type ObjectElement
   * @memberof Element.prototype
   */
  attributes: {
    get: function() {
      if (!this._attributes) {
        var ObjectElement = require('./object-element');

        if (this.isFrozen) {
          var meta = new ObjectElement();
          meta.freeze();
          return meta;
        }

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

  /**
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
   * @type boolean
   * @readonly
   * @memberof Element.prototype
   */
  isFrozen: {
    get: function() {
      return Object.isFrozen(this);
    }
  },

  /**
   * @type ArraySlice
   * @readonly
   * @memberof Element.prototype
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
   * @type ArraySlice
   * @readonly
   * @memberof Element.prototype
   */
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

  /**
   * @type ArraySlice
   * @readonly
   * @memberof Element.prototype
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
