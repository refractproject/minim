'use strict';

var isNull = require('lodash/isNull');
var isString = require('lodash/isString');
var isNumber = require('lodash/isNumber');
var isBoolean = require('lodash/isBoolean');
var isObject = require('lodash/isObject');
var uptown = require('uptown');
var createClass = uptown.createClass;

var JSONSerialiser = require('./serialisers/json');
var elements = require('./elements');

/**
 * @class
 *
 * A refract element implementation with an extensible namespace, able to
 * load other namespaces into it.
 *
 * The namespace allows you to register your own classes to be instantiated
 * when a particular refract element is encountered, and allows you to specify
 * which elements get instantiated for existing Javascript objects.
 */
var Namespace = createClass({
  constructor: function(options) {
    this.elementMap = {};
    this.elementDetection = [];
    this.Element = elements.Element;
    this.KeyValuePair = elements.KeyValuePair;

    if (!options || !options.noDefault) {
      this.useDefault();
    }

    // These provide the defaults for new elements.
    this._attributeElementKeys = [];
    this._attributeElementArrayKeys = [];
  },

  /**
   * Use a namespace plugin or load a generic plugin.
   *
   * @param plugin
   *
   * @memberof Namespace.prototype
   */
  use: function(plugin) {
    if (plugin.namespace) {
      plugin.namespace({base: this});
    }
    if (plugin.load) {
      plugin.load({base: this});
    }
    return this;
  },

  /*
   * Use the default namespace. This preloads all the default elements
   * into this registry instance.
   */
  useDefault: function() {
    // Set up classes for default elements
    this
      .register('null', elements.NullElement)
      .register('string', elements.StringElement)
      .register('number', elements.NumberElement)
      .register('boolean', elements.BooleanElement)
      .register('array', elements.ArrayElement)
      .register('object', elements.ObjectElement)
      .register('member', elements.MemberElement)
      .register('ref', elements.RefElement)
      .register('link', elements.LinkElement);

    // Add instance detection functions to convert existing objects into
    // the corresponding refract elements.
    this
      .detect(isNull, elements.NullElement, false)
      .detect(isString, elements.StringElement, false)
      .detect(isNumber, elements.NumberElement, false)
      .detect(isBoolean, elements.BooleanElement, false)
      .detect(Array.isArray, elements.ArrayElement, false)
      .detect(isObject, elements.ObjectElement, false);

    return this;
  },

  /**
   * Register a new element class for an element.
   *
   * @param {string} name
   * @param elementClass
   *
   * @memberof Namespace.prototype
   */
  register: function(name, ElementClass) {
    this._elements = undefined;
    this.elementMap[name] = ElementClass;
    return this;
  },

  /**
   * Unregister a previously registered class for an element.
   *
   * @param {string} name
   *
   * @memberof Namespace.prototype
   */
  unregister: function(name) {
    this._elements = undefined;
    delete this.elementMap[name];
    return this;
  },

  /*
   * Add a new detection function to determine which element
   * class to use when converting existing js instances into
   * refract element.
   */
  detect: function(test, ElementClass, givenPrepend) {
    var prepend = givenPrepend === undefined ? true : givenPrepend;

    if (prepend) {
      this.elementDetection.unshift([test, ElementClass]);
    } else {
      this.elementDetection.push([test, ElementClass]);
    }

    return this;
  },

  /*
   * Convert an existing Javascript object into refract element instances, which
   * can be further processed or serialized into refract.
   * If the item passed in is already refracted, then it is returned
   * unmodified.
   */
  toElement: function(value) {
    if (value instanceof this.Element) { return value; }

    var element;

    for(var i = 0; i < this.elementDetection.length; i++) {
      var test = this.elementDetection[i][0];
      var ElementClass = this.elementDetection[i][1];

      if (test(value)) {
        element = new ElementClass(value);
        break;
      }
    }

    return element;
  },

  /*
   * Get an element class given an element name.
   */
  getElementClass: function(element) {
    var ElementClass = this.elementMap[element];

    if (ElementClass === undefined) {
      // Fall back to the base element. We may not know what
      // to do with the `content`, but downstream software
      // may know.
      return this.Element;
    }

    return ElementClass;
  },

  /*
   * Convert a refract document into refract element instances.
   */
  fromRefract: function(doc) {
    return this.serialiser.deserialise(doc);
  },

  /*
   * Convert an element to a Refracted JSON object.
   */
  toRefract: function(element) {
    return this.serialiser.serialise(element);
  }
}, {}, {
  /*
   * Get an object that contains all registered element classes, where
   * the key is the PascalCased element name and the value is the class.
   */
  elements: {
    get: function() {
      if (this._elements === undefined) {
        var name, pascal;
        this._elements = {
          Element: this.Element
        };

        for (name in this.elementMap) {
          // Currently, all registered element types use a camelCaseName.
          // Converting to PascalCase is as simple as upper-casing the first
          // letter.
          pascal = name[0].toUpperCase() + name.substr(1);
          this._elements[pascal] = this.elementMap[name];
        }
      }

      return this._elements;
    }
  },

  /**
   * Convinience method for getting a JSON Serialiser configured with the
   * current namespace
   *
   * @type JSONSerialiser
   * @readonly
   *
   * @memberof Namespace.prototype
   */
  serialiser: {
    get: function() {
      return new JSONSerialiser(this);
    }
  }
});

JSONSerialiser.prototype.Namespace = Namespace;

module.exports = Namespace;