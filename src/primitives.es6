/*
 * A refract element implementation with an extensible type registry.
 */

import _ from 'lodash';
import {convertToType, convertFromRefract, convertFromCompactRefract} from './convert';

/*
 * A private symbol for subclasses to set key names of attributes which should
 * be converted from refract elements rather than simple types.
 */
export const attributeElementKeys = Symbol('attributeElementKeys');

/*
 * ElementType is the base element from which all other elements are built.
 * It has no specific information about how to handle the content, but is
 * able to convert to and from Refract/Javascript.
 */
export class ElementType {
  constructor(element, content=null, meta={}, attributes={}) {
    this.element = element;
    this.meta = meta;
    this.attributes = attributes;
    this.content = content;

    this[attributeElementKeys] = [];
  }

  toValue() {
    return this.content;
  }

  toRefract(options={}) {
    const attributes = this.convertAttributesToRefract('toRefract');
    const initial = {
      element: this.element,
      meta: this.meta,
      attributes,
      content: this.content
    };
    return _.extend(initial, options);
  }

  toCompactRefract() {
    const attributes = this.convertAttributesToRefract('toCompactRefract');
    return [this.element, this.meta, attributes, this.content];
  }

  /*
   * Some attributes may be elements. This is domain-specific knowledge, so
   * a subclass *MUST* define the attribute element names to convert. This
   * method handles the actual serialization to refract.
   */
  convertAttributesToRefract(functionName) {
    const attributes = {};

    for (let name in this.attributes) {
      if (this[attributeElementKeys].indexOf(name) !== -1) {
        attributes[name] = this.attributes[name][functionName]();
      } else {
        attributes[name] = this.attributes[name];
      }
    }

    return attributes;
  }

  /*
   * Some attributes may be elements. This is domain-specific knowledge, so
   * a subclass *MUST* define the attribute element names to convert. This
   * method handles the actual conversion when loading.
   */
  convertAttributesToElements(conversionFunc) {
    for (let name of this[attributeElementKeys]) {
      if (this.attributes[name]) {
        this.attributes[name] = conversionFunc(this.attributes[name]);
      }
    }
  }

  fromRefract(dom) {
    this.element = dom.element;
    this.meta = dom.meta;
    this.attributes = dom.attributes;
    this.content = dom.content;

    this.convertAttributesToElements(convertFromRefract);

    return this;
  }

  fromCompactRefract(tuple) {
    this.element = tuple[0];
    this.meta = tuple[1];
    this.attributes = tuple[2];
    this.content = tuple[3];

    this.convertAttributesToElements(convertFromCompactRefract);

    return this;
  }

  get() {
    return this.content;
  }

  set(content) {
    this.content = content;
    return this;
  }
}

export class NullType extends ElementType {
  constructor(meta, attributes) {
    super('null', meta, attributes, null);
  }

  set() {
    return new Error('Cannot set the value of null');
  }
}

export class StringType extends ElementType {
  constructor(content, meta, attributes) {
    super('string', content, meta, attributes);
  }

  get length() {
    return this.content.length;
  }
}

export class NumberType extends ElementType {
  constructor(content, meta, attributes) {
    super('number', content, meta, attributes);
  }
}

export class BooleanType extends ElementType {
  constructor(content, meta, attributes) {
    super('boolean', content, meta, attributes);
  }
}

class Collection extends ElementType {
  get length() {
    return this.content.length;
  }

  get [Symbol.iterator]() {
    return this.content[Symbol.iterator];
  }

  toValue() {
    return this.content.map((el) => el.toValue());
  }

  toRefract() {
    return super.toRefract({
      content: this.content.map((el) => el.toRefract())
    });
  }

  toCompactRefract() {
    const attributes = this.convertAttributesToRefract('toCompactRefract');
    const compactDoms = this.content.map((el) =>
      el.toCompactRefract());
    return [this.element, this.meta, attributes, compactDoms];
  }

  fromRefract(dom) {
    this.element = dom.element;
    this.meta = dom.meta;
    this.attributes = dom.attributes;
    this.content = (dom.content || []).map((content) =>
      convertFromRefract(content));

    this.convertAttributesToElements(convertFromRefract);

    return this;
  }

  fromCompactRefract(tuple) {
    this.element = tuple[0];
    this.meta = tuple[1];
    this.attributes = tuple[2];
    this.content = (tuple[3] || []).map((content) =>
      convertFromCompactRefract(content));

    this.convertAttributesToElements(convertFromCompactRefract);

    return this;
  }

  get(index) {
    return index === undefined ? this : this.content[index];
  }

  set(index, value) {
    this.content[index] = convertToType(value);
    return this;
  }

  map(cb) {
    return this.content.map(cb);
  }

  filter(condition) {
    const newArray = new Collection();
    newArray.content = this.content.filter(condition);
    return newArray;
  }

  forEach(cb) {
    this.content.forEach(cb);
  }

  push(value) {
    this.content.push(convertToType(value));
    return this;
  }

  add(value) {
    this.push(value);
  }

  findElements(condition, options={}) {
    const recursive = options.recursive === undefined ? false : options.recursive;
    const results = options.results === undefined ? [] : options.results;

    this.content.forEach((el) => {
      // We use duck-typing here to support any registered class that
      // may contain other elements.
      if (recursive && (el.findElements !== undefined)) {
          el.findElements(condition, {results, recursive});
      }
      if (condition(el)) {
        results.push(el);
      }
    });
    return results;
  }

  find(condition, options) {
    const newArray = new Collection();
    newArray.content = this.findElements(condition, options);
    return newArray;
  }
}

export class ArrayType extends Collection {
  constructor(content=[], meta={}, attributes={}) {
    const converted = content.map((value) => convertToType(value));

    super('array', converted, meta, attributes);
  }
}

export class ObjectType extends Collection {
  constructor(content={}, meta={}, attributes={}) {
    const converted = Object.keys(content).map((key) => {
      const element = convertToType(content[key]);
      element.meta.name = key;
      return element;
    });
    super('object', converted, meta, attributes);
  }

  toValue() {
    return this.content.reduce((results, el) => {
      results[el.meta.name] = el.toValue();
      return results;
    }, {});
  }

  get(name) {
    return name === undefined ? this : _.first(
      this.content.filter((value) => value.meta.name === name)
    );
  }

  set(name, value) {
    const location = this.content.map(i => i.meta.name).indexOf(name);

    value = convertToType(value);
    // TODO: Should we mutate or copy here? Of course it doesn't matter
    //       for non-refracted elements as they get copied anyway, but
    //       if the input is already refracted and we add it to multiple
    //       objects with a different name suddenly we have a problem.
    //       We have the same problem in the constructor above.
    value.meta.name = name;

    if (location !== -1) {
      this.content.splice(location, 1, value);
    } else {
      this.content.push(value);
    }

    return this;
  }

  keys() {
    return this.content.map((value) => value.meta.name);
  }

  values() {
    return this.content.map((value) => value.get());
  }

  items() {
    return this.content.map((value) => [value.meta.name, value.get()]);
  }
}

/*
 * The type registry allows you to register your own classes to be instantiated
 * when a particular refract element is encountered, and allows you to specify
 * which elements get instantiated for existing Javascript objects.
 */
export const TypeRegistry = {
  // A mapping of element name => type class used when loading from refract.
  elementMap: {
    'null': NullType,
    'string': StringType,
    'number': NumberType,
    'boolean': BooleanType,
    'array': ArrayType,
    'object': ObjectType
  },
  // How to convert existing Javascript variables into refract types.
  typeDetection: [
    [_.isNull, NullType],
    [_.isString, StringType],
    [_.isNumber, NumberType],
    [_.isBoolean, BooleanType],
    [_.isArray, ArrayType],
    [_.isObject, ObjectType]
  ]
};