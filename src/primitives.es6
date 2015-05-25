/*
 * A refract element implementation with an extensible type registry.
 */

import _ from 'lodash';
import registry from './registry';

/*
 * A private symbol for subclasses to set key names of attributes which should
 * be converted from refract elements rather than simple types.
 */
export const attributeElementKeys = Symbol('attributeElementKeys');
export const storedElement = Symbol('storedElement');

export class Meta {
  constructor(meta = {}) {
    this.meta = {};

    for (let key of Object.keys(meta)) {
      this.meta[key] = registry.toType(meta[key]);
    }
  }

  toObject() {
    let meta = {};

    for (let key of Object.keys(this.meta)) {
      meta[key] = this.meta[key].toValue();
    }

    return meta;
  }

  getProperty(name, value) {
    if (!this.meta[name]) {
      this.meta[name] = registry.toType(value);
    }

    return this.meta[name];
  }

  setProperty(name, value) {
    this.meta[name] = registry.toType(value);
  }

  get id() {
    return this.getProperty('id', '');
  }

  set id(value) {
    this.setProperty('id', value);
  }

  get class() {
    return this.getProperty('class', []);
  }

  set class(value) {
    this.setProperty('class', value);
  }

  get name() {
    return this.getProperty('name', '');
  }

  set name(value) {
    this.setProperty('name', value);
  }

  get title() {
    return this.getProperty('title', '');
  }

  set title(value) {
    this.setProperty('title', value);
  }

  get description() {
    return this.getProperty('description', '');
  }

  set description(value) {
    this.setProperty('description', value);
  }
}

/*
 * ElementType is the base element from which all other elements are built.
 * It has no specific information about how to handle the content, but is
 * able to convert to and from Refract/Javascript.
 */
export class ElementType {
  constructor(content = null, meta = {}, attributes = {}) {
    this.meta = new Meta(meta);
    this.attributes = attributes;
    this.content = content;
    this[attributeElementKeys] = [];
  }

  get element() {
    // Returns 'element' so we don't have undefined as element
    return this[storedElement] || 'element';
  }

  set element(element) {
    this[storedElement] = element;
  }

  primitive() {
    return;
  }

  toValue() {
    return this.content;
  }

  toRefract(options = {}) {
    const attributes = this.convertAttributesToRefract('toRefract');
    const initial = {
      element: this.element,
      meta: this.meta.toObject(),
      attributes,
      content: this.content
    };
    return _.extend(initial, options);
  }

  toCompactRefract() {
    const attributes = this.convertAttributesToRefract('toCompactRefract');
    return [this.element, this.meta.toObject(), attributes, this.content];
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
    this.meta = new Meta(dom.meta);
    this.attributes = dom.attributes;
    this.content = dom.content;

    this.convertAttributesToElements((attribute) =>
      registry.fromRefract(attribute));

    if (this.element !== dom.element) {
      this.element = dom.element;
    }

    return this;
  }

  fromCompactRefract(tuple) {
    this.meta = new Meta(tuple[1]);
    this.attributes = tuple[2];
    this.content = tuple[3];

    this.convertAttributesToElements((attribute) =>
      registry.fromCompactRefract(attribute));

    if (this.element !== tuple[0]) {
      this.element = tuple[0];
    }

    return this;
  }

  get() {
    return this.content;
  }

  set(content) {
    this.content = content;
    return this;
  }

  equals(value) {
    return _.isEqual(this.toValue(), value);
  }
}

export class NullType extends ElementType {
  constructor(...args) {
    super(...args);
    this.element = 'null';
  }

  primitive() {
    return 'null';
  }

  set() {
    return new Error('Cannot set the value of null');
  }
}

export class StringType extends ElementType {
  constructor(...args) {
    super(...args);
    this.element = 'string';
  }

  primitive() {
    return 'string';
  }

  get length() {
    return this.content.length;
  }
}

export class NumberType extends ElementType {
  constructor(...args) {
    super(...args);
    this.element = 'number';
  }

  primitive() {
    return 'number';
  }
}

export class BooleanType extends ElementType {
  constructor(...args) {
    super(...args);
    this.element = 'boolean';
  }

  primitive() {
    return 'boolean';
  }
}

class Collection extends ElementType {
  get length() {
    return this.content.length;
  }

  /*
   * This defines an iterator that allows instances of this class to be
   * iterated over, e.g. by using a for...of loop.
   */
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
    return [this.element, this.meta.toObject(), attributes, compactDoms];
  }

  fromRefract(dom) {
    this.meta = new Meta(dom.meta);
    this.attributes = dom.attributes;
    this.content = (dom.content || []).map((content) =>
      registry.fromRefract(content));

    this.convertAttributesToElements((attribute) =>
      registry.fromRefract(attribute));

    if (this.element !== dom.element) {
      this.element = dom.element;
    }

    return this;
  }

  fromCompactRefract(tuple) {
    this.meta = new Meta(tuple[1]);
    this.attributes = tuple[2];
    this.content = (tuple[3] || []).map((content) =>
      registry.fromCompactRefract(content));

    this.convertAttributesToElements((attribute) =>
      registry.fromCompactRefract(attribute));

    if (this.element !== tuple[0]) {
      this.element = tuple[0];
    }

    return this;
  }

  get(index) {
    return index === undefined ? this : this.content[index];
  }

  set(index, value) {
    this.content[index] = registry.toType(value);
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
    this.content.push(registry.toType(value));
    return this;
  }

  add(value) {
    this.push(value);
  }

  findElements(condition, options={}) {
    const recursive = !!options.recursive;
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

  /*
   * Recusively search all descendents using a condition function.
   */
  find(condition) {
    const newArray = new Collection();
    newArray.content = this.findElements(condition, {recursive: true});
    return newArray;
  }

  /*
   * Search all direct descendents using a condition function.
   */
  children(condition) {
    const newArray = new Collection();
    newArray.content = this.findElements(condition, {recursive: false});
    return newArray;
  }

  /*
   * Search the tree recursively and find the element with the matching ID
   */
  getById(id) {
    return this.find(item => item.meta.id.toValue() === id).first();
  }

  /*
   * Return the first item in the collection
   */
  first() {
    return this.get(0);
  }

  /*
   * Return the second item in the collection
   */
  second() {
    return this.get(1);
  }

  /*
   * Return the last item in the collection
   */
  last() {
    return this.get(this.length - 1);
  }

  /*
   * Looks for matching children using deep equality
   */
  contains(value) {
    for (let item of this.content) {
      if (_.isEqual(item.toValue(), value)) {
        return true;
      }
    }

    return false;
  }
}

export class ArrayType extends Collection {
  constructor(content=[], meta={}, attributes={}) {
    // Allow for content to be given that is not refracted
    const refractedContent = content.map((value) => registry.toType(value));

    super(refractedContent, meta, attributes);
    this.element = 'array';
  }

  primitive() {
    return 'array';
  }
}

export class ObjectType extends Collection {
  constructor(content={}, meta={}, attributes={}) {
    // Allow for content to be given that is not refracted
    const refractedContent = Object.keys(content).map((key) => {
      const element = registry.toType(content[key]);
      element.meta.name = key;
      return element;
    });

    super(refractedContent, meta, attributes);
    this.element = 'object';
  }

  primitive() {
    return 'object';
  }

  toValue() {
    return this.content.reduce((results, el) => {
      results[el.meta.name.toValue()] = el.toValue();
      return results;
    }, {});
  }

  get(name) {
    return name === undefined ? this : _.first(
      this.content.filter((value) => value.meta.name.toValue() === name)
    );
  }

  set(name, value) {
    const location = this.content.map(item => item.meta.name.toValue()).indexOf(name);

    let refractedContent = registry.toType(value);
    // TODO: Should we mutate or copy here? Of course it doesn't matter
    //       for non-refracted elements as they get copied anyway, but
    //       if the input is already refracted and we add it to multiple
    //       objects with a different name suddenly we have a problem.
    //       We have the same problem in the constructor above.
    refractedContent.meta.name = name;

    if (location !== -1) {
      this.content.splice(location, 1, refractedContent);
    } else {
      this.content.push(refractedContent);
    }

    return this;
  }

  keys() {
    return this.content.map((value) => value.meta.name.toValue());
  }

  values() {
    return this.content.map((value) => value.get());
  }

  hasKey(value) {
    for (let item of this.content) {
      if (item.meta.name.equals(value)) {
        return true;
      }
    }

    return false;
  }

  items() {
    return this.content.map((value) => [value.meta.name.toValue(), value.get()]);
  }
}
