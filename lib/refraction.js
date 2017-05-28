'use strict';

/// Refracts a JSON type to minim elements
function refract(value) {
  var ArrayElement = require('./primitives/array-element');
  var NumberElement = require('./primitives/number-element');
  var StringElement = require('./primitives/string-element');
  var BooleanElement = require('./primitives/boolean-element');
  var NullElement = require('./primitives/null-element');

  if (typeof value === 'string') {
    return new StringElement(value);
  } else if (typeof value === 'number') {
    return new NumberElement(value);
  } else if (typeof value === 'boolean') {
    return new BooleanElement(value);
  } else if (value === null) {
    return new NullElement();
  } else if (Array.isArray(value)) {
    return new ArrayElement(value.map(refract));
  }

  return value;
}

module.exports = {
  refract: refract
};
