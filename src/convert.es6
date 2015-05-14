import {ElementType, TypeRegistry} from './primitives';

/*
 * Convert an existing Javascript object into refract type instances, which
 * can be further processed or serialized into refract or compact refract.
 * If the item passed in is already refracted, then it is returned
 * unmodified.
 */
export function convertToType(value) {
  if (value instanceof ElementType) { return value; }

  let element;

  for (let [test, ElementClass] of TypeRegistry.typeDetection) {
    if (test(value)) {
      element = new ElementClass(value);
      break;
    }
  }

  return element;
}

function getElementClass(element) {
  let ElementClass = TypeRegistry.elementMap[element];

  if (ElementClass === undefined) {
    // Fall back to the base element. We may not know what
    // to do with the `content`, but downstream software
    // may know.
    ElementClass = ElementType;
  }

  return ElementClass;
}

/*
 * Convert a long-form refract DOM into refract type instances. This uses
 * the type registry above.
 */
export function convertFromRefract(dom) {
  let ElementClass = getElementClass(dom.element);
  return new ElementClass().fromRefract(dom);
}

/*
 * Convert a compact refract tuple into refract type instances. This uses
 * the type registry above.
 */
export function convertFromCompactRefract(tuple) {
  let ElementClass = getElementClass(tuple[0]);
  return new ElementClass().fromCompactRefract(tuple);
}
