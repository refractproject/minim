'use strict';

let Element;
let StringElement;
let MemberElement;
let NumberElement;
let BooleanElement;
let NullElement;
let ArrayElement;
let ObjectElement;

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
    const element = new ObjectElement();

    for (const key in value) {
      element.set(key, value[key]);
    }

    return element;
  }

  return value;
}

module.exports = {
  refract: refract
};
