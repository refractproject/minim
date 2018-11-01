'use strict';

var elements;

function load() {
  elements = require('./elements');
}

/**
 * Refracts a JSON type to minim elements
 * @param value
 * @returns {Element}
 */
function refract(value) {
  if (!elements) {
    // Lazy load all of the elements
    load();
  }

  if (value instanceof elements.Element) {
    return value;
  } else if (typeof value === 'string') {
    return new elements.StringElement(value);
  } else if (typeof value === 'number') {
    return new elements.NumberElement(value);
  } else if (typeof value === 'boolean') {
    return new elements.BooleanElement(value);
  } else if (value === null) {
    return new elements.NullElement();
  } else if (Array.isArray(value)) {
    return new elements.ArrayElement(value.map(refract));
  } else if (typeof value === 'object') {
    var element = new elements.ObjectElement();

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
