'use strict';

var refract = require('./refraction').refract;
var _ = require('lodash');

// Coerces an a parameter into a callback for matching elements.
// This accepts an element name, an element type and returns a
// callback to match for those elements.
function coerceElementMatchingCallback(value) {
  // Element Name
  if (typeof value === 'string') {
    return function (element) {
      return element.element === value;
    };
  }

  // Element Type
  if (value.name) {
    return function (element) {
      return element instanceof value;
    };
  }

  return value;
}

/**
 * @param {Element[]} elements
 *
 * @property {Element[]} elements
 */
class ArraySlice {
  constructor(elements) {
    this.elements = elements || [];
  }

  /**
   * @returns {Array}
   */
  toValue () {
    return this.elements.map((element) => {
      return element.toValue();
    });
  }

  // High Order Functions

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {array} A new array with each element being the result of the callback function
   */
  map (callback, thisArg) {
    return this.elements.map(callback, thisArg);
  }

  /**
   * Maps and then flattens the results.
   * @param callback - Function to execute for each element.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {Element}
   */
  flatMap (callback, thisArg) {
    var results = [];

    this.forEach(function (element) {
      var result = callback(element);

      if (result) {
        results.push(result);
      }
    }, thisArg);

    return results;
  }

  /**
   * @param callback - Function to execute for each element. This may be a callback, an element name or an element class.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {ArraySlice}
   */
  filter (callback, thisArg) {
    callback = coerceElementMatchingCallback(callback);
    return new ArraySlice(this.elements.filter(callback, thisArg));
  }

  /**
   * @param callback - Function to execute for each element. This may be a callback, an element name or an element class.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {ArraySlice}
   */
  reject (callback, thisArg) {
    callback = coerceElementMatchingCallback(callback);
    return new ArraySlice(this.elements.filter(_.negate(callback), thisArg));
  }

  /**
   * Returns the first element in the array that satisfies the given value
   * @param callback - Function to execute for each element. This may be a callback, an element name or an element class.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {Element}
   */
  find (callback, thisArg) {
    callback = coerceElementMatchingCallback(callback);
    return this.elements.find(callback, thisArg);
  }

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   */
  forEach (callback, thisArg) {
    this.elements.forEach(callback, thisArg);
  }

  /**
   * @param callback - Function to execute for each element
   * @param initialValue
   */
  reduce (callback, initialValue) {
    return this.elements.reduce(callback, initialValue);
  }

  /**
   * @param value
   * @returns {boolean}
   */
  includes(value) {
    return this.elements.some(function (element) {
      return element.equals(value);
    });
  }

  // Mutation

  /**
   * Removes the first element from the slice
   * @returns {Element} The removed element or undefined if the slice is empty
   */
  shift() {
    return this.elements.shift();
  }

  /**
   * Adds the given element to the begining of the slice
   * @parameter {Element}
   */
  unshift(value) {
    this.elements.unshift(refract(value));
  }

  /**
   * Adds the given element to the end of the slice
   * @parameter {Element}
   */
  push(value) {
    this.elements.push(refract(value));
    return this;
  }

  /**
   * @parameter {Element}
   */
  add(value) {
    this.push(value);
  }

  // Accessors

  /**
   * @parameter {number}
   * @returns {Element}
   */
  get(index) {
    return this.elements[index];
  }

  /**
   * @parameter {number}
   */
  getValue(index) {
    var element = this.elements[index];

    if (element) {
      return element.toValue();
    }

    return undefined;
  }

  /**
   * Returns the number of elements in the slice
   * @type number
   * @readonly
   */
  get length() {
    return this.elements.length;
  }

  /**
   * Returns whether the slice is empty
   * @type boolean
   * @readonly
   */
  get isEmpty() {
    return this.elements.length === 0;
  }

  /**
   * Returns the first element in the slice or undefined if the slice is empty
   * @type Element
   * @readonly
   */
  get first () {
    return this.elements[0];
  }
}

if (typeof Symbol !== 'undefined') {
  ArraySlice.prototype[Symbol.iterator] = function () {
    return this.elements[Symbol.iterator]();
  };
}

module.exports = ArraySlice;
