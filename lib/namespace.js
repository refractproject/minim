'use strict';

const _ = require('lodash');

/**
 * A refract element implementation with an extensible namespace, able to
 * load other namespaces into it.
 *
 * The namespace allows you to register your own classes to be instantiated
 * when a particular refract element is encountered, and allows you to specify
 * which elements get instantiated for existing Javascript objects.
 */
class Namespace {
  constructor(options) {
    this.elementMap = {};
    this.elementDetection = [];
    this.Element = require('./primitives/element');

    if (!options || !options.noDefault) {
      this.useDefault();
    }

    // These provide the defaults for new elements.
    this._attributeElementKeys = [];
    this._attributeElementArrayKeys = [];
  }

  /**
   * Use a namespace plugin or load a generic plugin.
   *
   * @param plugin
   */
  use(plugin) {
    if (plugin.namespace) {
      plugin.namespace({base: this});
    }
    if (plugin.load) {
      plugin.load({base: this});
    }
    return this;
  }

  /*
   * Use the default namespace. This preloads all the default elements
   * into this registry instance.
   */
  useDefault() {
    const NullElement = require('./primitives/null-element');
    const StringElement = require('./primitives/string-element');
    const NumberElement = require('./primitives/number-element');
    const BooleanElement = require('./primitives/boolean-element');
    const ArrayElement = require('./primitives/array-element');
    const MemberElement = require('./primitives/member-element');
    const ObjectElement = require('./primitives/object-element');

    // Some elements are not necessarily primitive values, but meta elements
    const LinkElement = require('./elements/link-element');
    const RefElement = require('./elements/ref-element');

    // Set up classes for default elements
    this
      .register('null', NullElement)
      .register('string', StringElement)
      .register('number', NumberElement)
      .register('boolean', BooleanElement)
      .register('array', ArrayElement)
      .register('object', ObjectElement)
      .register('member', MemberElement)
      .register('ref', RefElement)
      .register('link', LinkElement);

    // Add instance detection functions to convert existing objects into
    // the corresponding refract elements.
    this
      .detect(_.isNull, NullElement, false)
      .detect(_.isString, StringElement, false)
      .detect(_.isNumber, NumberElement, false)
      .detect(_.isBoolean, BooleanElement, false)
      .detect(_.isArray, ArrayElement, false)
      .detect(_.isObject, ObjectElement, false);

    return this;
  }

  /**
   * Register a new element class for an element.
   *
   * @param {string} name
   * @param elementClass
   */
  register(name, ElementClass) {
    this._elements = undefined;
    this.elementMap[name] = ElementClass;
    return this;
  }

  /**
   * Unregister a previously registered class for an element.
   *
   * @param {string} name
   */
  unregister(name) {
    this._elements = undefined;
    delete this.elementMap[name];
    return this;
  }

  /*
   * Add a new detection function to determine which element
   * class to use when converting existing js instances into
   * refract element.
   */
  detect(test, ElementClass, givenPrepend) {
    const prepend = givenPrepend === undefined ? true : givenPrepend;

    if (prepend) {
      this.elementDetection.unshift([test, ElementClass]);
    } else {
      this.elementDetection.push([test, ElementClass]);
    }

    return this;
  }

  /*
   * Convert an existing Javascript object into refract element instances, which
   * can be further processed or serialized into refract.
   * If the item passed in is already refracted, then it is returned
   * unmodified.
   */
  toElement(value) {
    if (value instanceof this.Element) { return value; }

    let element;

    for (let i = 0; i < this.elementDetection.length; i++) {
      const test = this.elementDetection[i][0];
      const ElementClass = this.elementDetection[i][1];

      if (test(value)) {
        element = new ElementClass(value);
        break;
      }
    }

    return element;
  }

  /*
   * Get an element class given an element name.
   */
  getElementClass(element) {
    const ElementClass = this.elementMap[element];

    if (ElementClass === undefined) {
      // Fall back to the base element. We may not know what
      // to do with the `content`, but downstream software
      // may know.
      return this.Element;
    }

    return ElementClass;
  }

  /*
   * Convert a refract document into refract element instances.
   */
  fromRefract(doc) {
    return this.serialiser.deserialise(doc);
  }

  /*
   * Convert an element to a Refracted JSON object.
   */
  toRefract(element) {
    return this.serialiser.serialise(element);
  }

  /*
   * Get an object that contains all registered element classes, where
   * the key is the PascalCased element name and the value is the class.
   */
  get elements() {
    if (this._elements === undefined) {
      let name, pascal;
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

  /**
   * Convinience method for getting a JSON Serialiser configured with the
   * current namespace
   *
   * @type JSONSerialiser
   * @readonly
   */
  get serialiser() {
    const JSONSerialiser = require('./serialisers/json');
    return new JSONSerialiser(this);
  }
}

module.exports = Namespace;
