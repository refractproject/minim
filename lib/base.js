'use strict';

var _ = require('lodash');

var uptown = require('uptown');
var createClass = uptown.createClass;
var ElementRegistry = require('./registry').ElementRegistry;

exports.init = function(registry) {
  // Allows for passing in a custom registry
  if (!registry) {
    registry = new ElementRegistry();
  }

  // Use dependency injection so we can split up into multiple files yet resolve
  // any circuluar dependencies. BaseElement is also defined above in order to
  // satisfy any linting issues.
  var BaseElement = require('./primitives/base-element')(registry);

  // The registry needs a base element to determine the base type of an element.
  registry.BaseElement = BaseElement;

  var NullElement = require('./primitives/null-element')(BaseElement);
  var StringElement = require('./primitives/string-element')(BaseElement);
  var NumberElement = require('./primitives/number-element')(BaseElement);
  var BooleanElement = require('./primitives/boolean-element')(BaseElement);
  var ArrayElement = require('./primitives/array-element')(BaseElement, registry);
  var MemberElement = require('./primitives/member-element')(BaseElement, registry);
  var ObjectElement = require('./primitives/object-element')(BaseElement, ArrayElement, MemberElement);

  // Set up classes for default elements
  registry
    .register('null', NullElement)
    .register('string', StringElement)
    .register('number', NumberElement)
    .register('boolean', BooleanElement)
    .register('array', ArrayElement)
    .register('object', ObjectElement)
    .register('member', MemberElement);

  // Add instance detection functions to convert existing objects into
  // the corresponding refract elements.
  registry
    .detect(_.isNull, NullElement, false)
    .detect(_.isString, StringElement, false)
    .detect(_.isNumber, NumberElement, false)
    .detect(_.isBoolean, BooleanElement, false)
    .detect(_.isArray, ArrayElement, false)
    .detect(_.isObject, ObjectElement, false);

  return {
    BaseElement: BaseElement,
    NullElement: NullElement,
    StringElement: StringElement,
    NumberElement: NumberElement,
    BooleanElement: BooleanElement,
    ArrayElement: ArrayElement,
    MemberElement: MemberElement,
    ObjectElement: ObjectElement,
    registry: registry,
    convertToElement: function() {
      return registry.toElement.apply(registry, arguments);
    },
    convertFromRefract: function() {
      return registry.fromRefract.apply(registry, arguments);
    },
    convertFromCompactRefract: function() {
      return registry.fromCompactRefract.apply(registry, arguments);
    }
  };
}
