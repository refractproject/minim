'use strict';

var _ = require('lodash');
var KeyValuePair = require('../key-value-pair');
var ArraySlice = require('../array-slice.js');

var ObjectElement;


function loadObjectElement() {
  if (!ObjectElement) {
    ObjectElement = require('./object-element');
  }
}

/**
 * @class
 *
 * @param content
 * @param meta
 * @param attributes
 *
 * @property {string} element
 */
class Element {
  constructor(content, meta, attributes) {
    // Lazy load this.meta and this.attributes because it's a Minim element
    // Otherwise, we get into circuluar calls
    if (meta) {
      this.meta = meta;
    }

    if (attributes) {
      this.attributes = attributes;
    }

    this.content = content !== undefined ? content : null;
  }

  /**
   * Freezes the element to prevent any mutation.
   * A frozen element will add `parent` property to every child element
   * to allow traversing up the element tree.
   */
  freeze() {
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
  }

  primitive() {
    return;
  }

  /**
   * Creates a deep clone of the instance
   */
  clone() {
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
  }

  /**
   */
  toValue() {
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
  }

  /**
   * Creates a reference pointing at the Element
   * @returns {RefElement}
   */
  toRef(path) {
    if (this.id.toValue() === '') {
      throw Error('Cannot create reference to an element that does not contain an ID');
    }

    var RefElement = require('../elements/ref-element');
    var ref = new RefElement(this.id.toValue());

    if (path) {
      ref.path = path;
    }

    return ref;
  }

  /**
   * Finds the given elements in the element tree.
   * When providing multiple element names, you must first freeze the element.
   *
   * @param {...elementNames}
   * @returns {ArraySlice}
   */
  findRecursive() {
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
  }

  set(content) {
    this.content = content;
    return this;
  }

  equals(value) {
    return _.isEqual(this.toValue(), value);
  }

  getMetaProperty(name, value) {
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
  }

  setMetaProperty(name, value) {
    this.meta.set(name, value);
  }

  /**
   * @type String
   */
  get element() {
    // Returns 'element' so we don't have undefined as element
    return this._storedElement || 'element';
  }

  set element(element) {
    this._storedElement = element;
  }

  /**
   * @type ObjectElement
   */
  get meta() {
    if (!this._meta) {
      loadObjectElement();

      if (this.isFrozen) {
        var meta = new ObjectElement();
        meta.freeze();
        return meta;
      }

      this._meta = new ObjectElement();
    }

    return this._meta;
  }


  set meta(value) {
    loadObjectElement();

    if (value instanceof ObjectElement) {
      this._meta = value;
    } else {
      this.meta.set(value || {});
    }
  }

  /**
   * @type ObjectElement
   */
  get attributes() {
    if (!this._attributes) {
      loadObjectElement();

      if (this.isFrozen) {
        var meta = new ObjectElement();
        meta.freeze();
        return meta;
      }

      this._attributes = new ObjectElement();
    }

    return this._attributes;
  }

  set attributes(value) {
    loadObjectElement();

    if (value instanceof ObjectElement) {
      this._attributes = value;
    } else {
      this.attributes.set(value || {});
    }
  }

  /**
   * @type StringElement
   */
  get id() {
    return this.getMetaProperty('id', '');
  }

  set id (element) {
    this.setMetaProperty('id', element);
  }

  /**
   * @type ArrayElement
   */
  get classes() {
    return this.getMetaProperty('classes', []);
  }
  set classes(element) {
    this.setMetaProperty('classes', element);
  }

  /**
   * @type StringElement
   */
  get title() {
    return this.getMetaProperty('title', '');
  }

  set title (element) {
    this.setMetaProperty('title', element);
  }

  /**
   * @type StringElement
   */
  get description() {
    return this.getMetaProperty('description', '');
  }
  set description(element) {
    this.setMetaProperty('description', element);
  }

  /**
   * @type ArrayElement
   */
  get links() {
    return this.getMetaProperty('links', []);
  }

  set links(element) {
    this.setMetaProperty('links', element);
  }

  /**
   * @type boolean
   * @readonly
   */
  get isFrozen() {
    return Object.isFrozen(this);
  }

  /**
   * @type ArraySlice
   * @readonly
   */
  get parents() {
    var parent = this.parent;
    var parents = new ArraySlice();

    while (parent) {
      parents.push(parent);
      parent = parent.parent;
    }

    return parents;
  }

  /**
   * @type ArraySlice
   * @readonly
   */
  get children() {
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

  /**
   * @type ArraySlice
   * @readonly
   */
  get recursiveChildren() {
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

module.exports = Element;
