'use strict';

var uptown = require('uptown');
var refract = require('./refraction').refract;
var createClass = uptown.createClass;
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
  if (value.constructor && value.extend) {
    return function (element) {
      return element instanceof value;
    };
  }

  return value;
}

/**
 * @class
 *
 * @param {Element[]} elements
 *
 * @property {Element[]} elements
 */
var ArraySlice = createClass({
  constructor: function (elements) {
    this.elements = elements || [];
  },

  /**
   * @returns {Array}
   * @memberof ArraySlice.prototype
   */
  toValue: function () {
    return this.elements.map(function (element) {
      return element.toValue();
    });
  },

  // High Order Functions

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {array} A new array with each element being the result of the callback function
   * @memberof ArraySlice.prototype
   */
  map: function (callback, thisArg) {
    return this.elements.map(callback, thisArg);
  },

  /**
   * Maps and then flattens the results.
   * @param callback - Function to execute for each element.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {Element}
   * @memberof ArraySlice.prototype
   */
  flatMap: function (callback, thisArg) {
    var results = [];

    this.forEach(function (element) {
      var result = callback(element);

      if (result) {
        results.push(result);
      }
    }, thisArg);

    return results;
  },

  /**
   * @param callback - Function to execute for each element. This may be a callback, an element name or an element class.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {ArraySlice}
   * @memberof ArraySlice.prototype
   */
  filter: function (callback, thisArg) {
    callback = coerceElementMatchingCallback(callback);
    return new ArraySlice(this.elements.filter(callback, thisArg));
  },

  /**
   * @param callback - Function to execute for each element. This may be a callback, an element name or an element class.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {ArraySlice}
   * @memberof ArraySlice.prototype
   */
  reject: function (callback, thisArg) {
    callback = coerceElementMatchingCallback(callback);
    return new ArraySlice(this.elements.filter(_.negate(callback), thisArg));
  },

  /**
   * Returns the first element in the array that satisfies the given value
   * @param callback - Function to execute for each element. This may be a callback, an element name or an element class.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {Element}
   * @memberof ArraySlice.prototype
   */
  find: function (callback, thisArg) {
    callback = coerceElementMatchingCallback(callback);
    return this.elements.find(callback, thisArg);
  },

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @memberof ArraySlice.prototype
   */
  forEach: function (callback, thisArg) {
    this.elements.forEach(callback, thisArg);
  },

  /**
   * @param callback - Function to execute for each element
   * @param initialValue
   * @memberof ArraySlice.prototype
   */
  reduce: function (callback, initialValue) {
    return this.elements.reduce(callback, initialValue);
  },

  /**
   * @param value
   * @returns {boolean}
   * @memberof ArraySlice.prototype
   */
  includes: function(value) {
    return this.elements.some(function (element) {
      return element.equals(value);
    });
  },

  // Mutation

  /**
   * Removes the first element from the slice
   * @returns {Element} The removed element or undefined if the slice is empty
   * @memberof ArraySlice.prototype
   */
  shift: function() {
    return this.elements.shift();
  },

  /**
   * Adds the given element to the begining of the slice
   * @parameter {Element}
   * @memberof ArraySlice.prototype
   */
  unshift: function(value) {
    this.elements.unshift(refract(value));
  },

  /**
   * Adds the given element to the end of the slice
   * @parameter {Element}
   * @memberof ArraySlice.prototype
   */
  push: function(value) {
    this.elements.push(refract(value));
    return this;
  },

  /**
   * @parameter {Element}
   * @memberof ArraySlice.prototype
   */
  add: function(value) {
    this.push(value);
  },

  // Accessors

  /**
   * @parameter {number}
   * @returns {Element}
   * @memberof ArraySlice.prototype
   */
  get: function(index) {
    return this.elements[index];
  },

  /**
   * @parameter {number}
   * @memberof ArraySlice.prototype
   */
  getValue: function(index) {
    var element = this.elements[index];

    if (element) {
      return element.toValue();
    }

    return undefined;
  }
}, {}, {
  /**
   * Returns the number of elements in the slice
   * @type number
   * @readonly
   * @memberof ArraySlice.prototype
   */
  length: {
    get: function () {
      return this.elements.length;
    }
  },

  /**
   * Returns whether the slice is empty
   * @type boolean
   * @readonly
   * @memberof ArraySlice.prototype
   */
  isEmpty: {
    get: function() {
      return this.elements.length === 0;
    }
  },

  /**
   * Returns the first element in the slice or undefined if the slice is empty
   * @type Element
   * @readonly
   * @memberof ArraySlice.prototype
   */
  first: {
    get: function() {
      return this.elements[0];
    }
  },
});

if (typeof Symbol !== 'undefined') {
  ArraySlice.prototype[Symbol.iterator] = function () {
    return this.elements[Symbol.iterator]();
  };
}

module.exports = ArraySlice;
