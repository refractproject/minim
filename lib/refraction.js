'use strict';

/**
 * Refracts a JSON type to minim elements
 * @param value
 * @returns {Element}
 */
function refract(value) {
  var Element = require('./primitives/element');
  var ArrayElement = require('./primitives/array-element');
  var NumberElement = require('./primitives/number-element');
  var StringElement = require('./primitives/string-element');
  var BooleanElement = require('./primitives/boolean-element');
  var NullElement = require('./primitives/null-element');
  var ObjectElement = require('./primitives/object-element');

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
