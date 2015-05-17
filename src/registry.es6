import {ElementType} from './primitives';

/*
 * The type registry allows you to register your own classes to be instantiated
 * when a particular refract element is encountered, and allows you to specify
 * which elements get instantiated for existing Javascript objects.
 */
export class TypeRegistry {
  constructor() {
    this.elementMap = {};
    this.typeDetection = [];
  }

  /*
   * Register a new element class for an element type.
   */
  register(name, ElementClass) {
    this.elementMap[name] = ElementClass;
    return this;
  }

  /*
   * Unregister a previously registered class for an element type.
   */
  unregister(name) {
    delete this.elementMap[name];
    return this;
  }

  /*
   * Add a new detection function to determine which element
   * class to use when converting existing js instances into
   * refract element types.
   */
  detect(test, ElementClass, prepend = true) {
    if (prepend) {
      this.typeDetection.unshift([test, ElementClass]);
    } else {
      this.typeDetection.push([test, ElementClass]);
    }
    return this;
  }

  /*
   * Convert an existing Javascript object into refract type instances, which
   * can be further processed or serialized into refract or compact refract.
   * If the item passed in is already refracted, then it is returned
   * unmodified.
   */
  toType(value) {
    if (value instanceof ElementType) { return value; }

    let element;

    for (let [test, ElementClass] of this.typeDetection) {
      if (test(value)) {
        element = new ElementClass(value);
        break;
      }
    }

    return element;
  }

  /*
   * Get an element class given an element type name.
   */
  getElementClass(element) {
    const ElementClass = this.elementMap[element];

    if (ElementClass === undefined) {
      // Fall back to the base element. We may not know what
      // to do with the `content`, but downstream software
      // may know.
      return ElementType;
    }

    return ElementClass;
  }

  /*
   * Convert a long-form refract DOM into refract type instances.
   */
   fromRefract(dom) {
    let ElementClass = this.getElementClass(dom.element);
    return new ElementClass().fromRefract(dom);
  }

  /*
   * Convert a compact refract tuple into refract type instances.
   */
  fromCompactRefract(tuple) {
    let ElementClass = this.getElementClass(tuple[0]);
    return new ElementClass().fromCompactRefract(tuple);
  }
}

// The default minim registry
export default new TypeRegistry();
