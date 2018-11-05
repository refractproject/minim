'use strict';

var Element = require('./primitives/element');
var NullElement = require('./primitives/null-element');
var StringElement = require('./primitives/string-element');
var NumberElement = require('./primitives/number-element');
var BooleanElement = require('./primitives/boolean-element');
var ArrayElement = require('./primitives/array-element');
var MemberElement = require('./primitives/member-element');
var ObjectElement = require('./primitives/object-element');
var LinkElement = require('./elements/link-element');
var RefElement = require('./elements/ref-element');

var ArraySlice = require('./array-slice');
var ObjectSlice = require('./object-slice');

var KeyValuePair = require('./key-value-pair');

/**
 * Refracts a JSON type to minim elements
 * @param value
 * @returns {Element}
 */
function refract(value) {
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
  Element: Element,
  NullElement: NullElement,
  StringElement: StringElement,
  NumberElement: NumberElement,
  BooleanElement: BooleanElement,
  ArrayElement: ArrayElement,
  MemberElement: MemberElement,
  ObjectElement: ObjectElement,
  LinkElement: LinkElement,
  RefElement: RefElement,

  refract: refract,

  ArraySlice: ArraySlice,
  ObjectSlice: ObjectSlice,
  KeyValuePair: KeyValuePair,
};
