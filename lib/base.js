'use strict';

var _ = require('lodash');

var uptown = require('uptown');
var createClass = uptown.createClass;

var BaseElement;

/*
 * A refract element implementation with an extensible element registry.
 *
 * The element registry allows you to register your own classes to be instantiated
 * when a particular refract element is encountered, and allows you to specify
 * which elements get instantiated for existing Javascript objects.
 */

var ElementRegistry = createClass({
  constructor: function() {
    this.elementMap = {};
    this.elementDetection = [];
  },

  /*
   * Register a new element class for an element.
   */
  register: function(name, ElementClass) {
    this.elementMap[name] = ElementClass;
    return this;
  },

  /*
   * Unregister a previously registered class for an element.
   */
  unregister: function(name) {
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
   * can be further processed or serialized into refract or compact refract.
   * If the item passed in is already refracted, then it is returned
   * unmodified.
   */
  toElement: function(value) {
    if (value instanceof BaseElement) { return value; }

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
      return BaseElement;
    }

    return ElementClass;
  },

  /*
   * Convert a long-form refract document into refract element instances.
   */
   fromRefract: function(doc) {
    var ElementClass = this.getElementClass(doc.element);
    return new ElementClass().fromRefract(doc);
  },

  /*
   * Convert a compact refract tuple into refract element instances.
   */
  fromCompactRefract: function(tuple) {
    var ElementClass = this.getElementClass(tuple[0]);
    return new ElementClass().fromCompactRefract(tuple);
  },

  fromEmbeddedRefract: function(value) {
    var element;
    var self = this;

    if (_.isArray(value)) {
      element = self.toElement([]);

      _.forEach(value, function(item) {
        element.push(self.fromEmbeddedRefract(item));
      });

      return element;
    }

    if (_.isObject(value)) {
      if (_.has(value, 'refract')) {
        element = self.fromRefract(value.refract);
      } else {
        element = self.toElement({});
      }

      // Objects get the properties of the object set as members
      // All other get the properties set as attributes
      element.fromEmbeddedRefract(_.omit(value, 'refract'));

      return element;
    }

    return self.toElement(value);
  }
});

// Initiate a default Minim registry
var registry = new ElementRegistry();

// Use dependency injection so we can split up into multiple files yet resolve
// any circuluar dependencies. BaseElement is also defined above in order to
// satisfy any linting issues.
BaseElement = require('./primitives/base-element')(registry);
var NullElement = require('./primitives/null-element')(BaseElement);
var StringElement = require('./primitives/string-element')(BaseElement);
var NumberElement = require('./primitives/number-element')(BaseElement);
var BooleanElement = require('./primitives/boolean-element')(BaseElement);
var ArrayElement = require('./primitives/array-element')(BaseElement, registry);
var MemberElement = require('./primitives/member-element')(BaseElement, registry);
var ObjectElement = require('./primitives/object-element')(BaseElement, ArrayElement, MemberElement, registry);

module.exports = {
  BaseElement: BaseElement,
  NullElement: NullElement,
  StringElement: StringElement,
  NumberElement: NumberElement,
  BooleanElement: BooleanElement,
  ArrayElement: ArrayElement,
  MemberElement: MemberElement,
  ObjectElement: ObjectElement,
  ElementRegistry: ElementRegistry,
  registry: registry
};
