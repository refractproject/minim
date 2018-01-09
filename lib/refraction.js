'use strict';

var Element;
var StringElement;
var MemberElement;
var NumberElement;
var BooleanElement;
var NullElement;
var ArrayElement;
var ObjectElement;

function load() {
  Element = require('./primitives/element');
  StringElement = require('./primitives/string-element');
  NumberElement = require('./primitives/number-element');
  BooleanElement = require('./primitives/boolean-element');
  NullElement = require('./primitives/null-element');
  ArrayElement = require('./primitives/array-element');
  ObjectElement = require('./primitives/object-element');
}

/**
 * Refracts a JSON type to minim elements
 * @param value
 * @returns {Element}
 */
function refract(value) {
  if (!Element) {
    // Lazy load all of the elements
    load();
  }

  if (value instanceof Element) {
    return value;
  } else if (typeof value === 'string') {
    return new StringElement(value);
  } else if (typeof value === 'number') {
    return new NumberElement(value);
  } else if (typeof value === 'boolean') {
    return new BooleanElement(value);
  } else if (value === null) {
    return new NullElement();
  } else if (Array.isArray(value)) {
    return new ArrayElement(value.map(refract));
  } else if (typeof value === 'object') {
    var element = new ObjectElement();

    for (var key in value) {
      element.set(key, value[key]);
    }

    return element;
  }

  return value;
}

module.exports = {
  refract: refract
};
