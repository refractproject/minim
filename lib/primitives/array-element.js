'use strict';

const refract = require('../refraction').refract;
const Element = require('./element');
const ArraySlice = require('../array-slice');
const _ = require('lodash');

/**
 * @param {Element[]} content
 * @param meta
 * @param attributes
 */
class ArrayElement extends Element {
  constructor(content, meta, attributes) {
    const convertedContent = (content || []).map(function(value) {
      return refract(value);
    });
    super(convertedContent, meta, attributes);
    this.element = 'array';
  }

  primitive() {
    return 'array';
  }

  /**
   */
  get(index) {
    return this.content[index];
  }

  /**
   * Helper for returning the value of an item
   * This works for both ArrayElement and ObjectElement instances
   */
  getValue(indexOrKey) {
    const item = this.get(indexOrKey);

    if (item) {
      return item.toValue();
    }

    return undefined;
  }

  /**
   */
  getIndex(index) {
    return this.content[index];
  }

  /**
   */
  set(index, value) {
    this.content[index] = refract(value);
    return this;
  }

  /**
   */
  remove (index) {
    const removed = this.content.splice(index, 1);

    if (removed.length) {
      return removed[0];
    }

    return null;
  }

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   */
  map(callback, thisArg) {
    return this.content.map(callback, thisArg);
  }

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {ArraySlice}
   */
  filter(callback, thisArg) {
    return new ArraySlice(this.content.filter(callback, thisArg));
  }

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {ArraySlice}
   */
  reject(callback, thisArg) {
    return this.filter(_.negate(callback), thisArg);
  }

  /**
   * This is a reduce function specifically for Minim arrays and objects. It
   * allows for returning normal values or Minim instances, so it converts any
   * primitives on each step.
   */
  reduce(callback, initialValue) {
    let startIndex;
    let memo;

    // Allows for defining a starting value of the reduce
    if (initialValue !== undefined) {
      startIndex = 0;
      memo = refract(initialValue);
    } else {
      startIndex = 1;
      // Object Element content items are member elements. Because of this,
      // the memo should start out as the member value rather than the
      // actual member itself.
      memo = this.primitive() === 'object' ? this.first.value : this.first;
    }

    // Sending each function call to the registry allows for passing Minim
    // instances through the function return. This means you can return
    // primitive values or return Minim instances and reduce will still work.
    for (let i = startIndex; i < this.length; i++) {
      const item = this.content[i];

      if (this.primitive() === 'object') {
        memo = refract(callback(memo, item.value, item.key, item, this));
      } else {
        memo = refract(callback(memo, item, i, this));
      }
    }

    return memo;
  }

  /**
   * @callback forEachCallback
   * @param {Element} currentValue
   * @param {NumberElement} index
   */

  /**
   * @param {forEachCallback} - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   */
  forEach(callback, thisArg) {
    this.content.forEach(function(item, index) {
      callback(item, refract(index));
    }, thisArg);
  }

  /**
   */
  shift() {
    return this.content.shift();
  }

  /**
   */
  unshift(value) {
    this.content.unshift(refract(value));
  }

  /**
   */
  push(value) {
    this.content.push(refract(value));
    return this;
  }

  /**
   */
  add(value) {
    this.push(value);
  }

  /**
   * Recusively search all descendents using a condition function.
   * @returns {array[Element]}
   */
  findElements(condition, givenOptions) {
    const options = givenOptions || {};
    const recursive = !!options.recursive;
    const results = options.results === undefined ? [] : options.results;

    // The forEach method for Object Elements returns value, key, and member.
    // This passes those along to the condition function below.
    this.forEach(function(item, keyOrIndex, member) {
      // We use duck-typing here to support any registered class that
      // may contain other elements.
      if (recursive && (item.findElements !== undefined)) {
        item.findElements(condition, {
          results: results,
          recursive: recursive
        });
      }

      if (condition(item, keyOrIndex, member)) {
        results.push(item);
      }
    });

    return results;
  }

  /**
   * Recusively search all descendents using a condition function.
   * @returns {ArraySlice}
   */
  find(condition) {
    return new ArraySlice(this.findElements(condition, {recursive: true}));
  }

  /**
   * @returns {ArraySlice}
   */
  findByElement(element) {
    return this.find(function(item) {
      return item.element === element;
    });
  }

  /**
   * @returns {ArraySlice}
   */
  findByClass(className) {
    return this.find(function(item) {
      return item.classes.contains(className);
    });
  }

  /**
   * Search the tree recursively and find the element with the matching ID
   * @returns {Element}
   */
  getById(id) {
    return this.find(function(item) {
      return item.id.toValue() === id;
    }).first;
  }

  /**
   * Looks for matching children using deep equality
   * @returns {boolean}
   */
  contains(value) {
    return this.content.some(function (element) {
      return element.equals(value);
    });
  }

  /**
   * @type number
   * @readonly
   */
  get length() {
    return this.content.length;
  }

  /**
   * @type boolean
   * @readonly
   */
  get isEmpty() {
    return this.content.length === 0;
  }

  /**
   * Return the first item in the collection
   * @type Element
   * @readonly
   */
  get first() {
    return this.getIndex(0);
  }

  /**
   * Return the second item in the collection
   * @type Element
   * @readonly
   */
  get second() {
    return this.getIndex(1);
  }

  /**
   * Return the last item in the collection
   * @type Element
   * @readonly
   */
  get last() {
    return this.getIndex(this.length - 1);
  }
}

if (typeof Symbol !== 'undefined') {
  ArrayElement.prototype[Symbol.iterator] = function () {
    return this.content[Symbol.iterator]();
  };
}

module.exports = ArrayElement;
