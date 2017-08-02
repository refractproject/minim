'use strict';

var _ = require('lodash');
var uptown = require('uptown');
var refract = require('./refraction').refract;
var createClass = uptown.createClass;

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
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {ArraySlice}
   * @memberof ArraySlice.prototype
   */
  filter: function (callback, thisArg) {
    return new ArraySlice(this.elements.filter(callback, thisArg));
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
    for (var i = 0; i < this.length; i++) {
      var item = this.elements[i];
      if (_.isEqual(item.toValue(), value)) {
        return true;
      }
    }

    return false;
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
