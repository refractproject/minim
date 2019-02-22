const Element = require('./primitives/element');
const NullElement = require('./primitives/null-element');
const StringElement = require('./primitives/string-element');
const NumberElement = require('./primitives/number-element');
const BooleanElement = require('./primitives/boolean-element');
const ArrayElement = require('./primitives/array-element');
const MemberElement = require('./primitives/member-element');
const ObjectElement = require('./primitives/object-element');
const LinkElement = require('./elements/link-element');
const RefElement = require('./elements/ref-element');

const ArraySlice = require('./array-slice');
const ObjectSlice = require('./object-slice');

const KeyValuePair = require('./key-value-pair');

/**
 * Refracts a JSON type to minim elements
 * @param value
 * @returns {Element}
 */
function refract(value) {
  if (value instanceof Element) {
    return value;
  }

  if (typeof value === 'string') {
    return new StringElement(value);
  }

  if (typeof value === 'number') {
    return new NumberElement(value);
  }

  if (typeof value === 'boolean') {
    return new BooleanElement(value);
  }

  if (value === null) {
    return new NullElement();
  }

  if (Array.isArray(value)) {
    return new ArrayElement(value.map(refract));
  }

  if (typeof value === 'object') {
    const element = new ObjectElement(value);
    return element;
  }

  return value;
}

Element.prototype.ObjectElement = ObjectElement;
Element.prototype.RefElement = RefElement;
Element.prototype.MemberElement = MemberElement;

Element.prototype.refract = refract;
ArraySlice.prototype.refract = refract;

/**
 * Contains all of the element classes, and related structures and methods
 * for handling with element instances.
 */
module.exports = {
  Element,
  NullElement,
  StringElement,
  NumberElement,
  BooleanElement,
  ArrayElement,
  MemberElement,
  ObjectElement,
  LinkElement,
  RefElement,

  refract,

  ArraySlice,
  ObjectSlice,
  KeyValuePair,
};
