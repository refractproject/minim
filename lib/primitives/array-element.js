'use strict';

var refract = require('../refraction').refract;
var Element = require('./element');
var ArraySlice = require('../array-slice');
var _ = require('lodash');

/**
 * @class
 *
 * @param {Element[]} content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
var ArrayElement = Element.extend({
  constructor: function (content, meta, attributes) {
    var convertedContent = (content || []).map(function(value) {
      return refract(value);
    });
    Element.call(this, convertedContent, meta || {}, attributes || {});
    this.element = 'array';
  },

  primitive: function() {
    return 'array';
  },

  /**
   * @memberof ArrayElement.prototype
   */
  get: function(index) {
    return this.content[index];
  },

  /**
   * Helper for returning the value of an item
   * This works for both ArrayElement and ObjectElement instances
   * @memberof ArrayElement.prototype
   */
  getValue: function(indexOrKey) {
    var item = this.get(indexOrKey);

    if (item) {
      return item.toValue();
    }

    return undefined;
  },

  /**
   * @memberof ArrayElement.prototype
   */
  getIndex: function(index) {
    return this.content[index];
  },

  /**
   * @memberof ArrayElement.prototype
   */
  set: function(index, value) {
    this.content[index] = refract(value);
    return this;
  },

  /**
   * @memberof ArrayElement.prototype
   */
  remove: function (index) {
    var removed = this.content.splice(index, 1);

    if (removed.length) {
      return removed[0];
    }

    return null;
  },

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @memberof ArrayElement.prototype
   */
  map: function(callback, thisArg) {
    return this.content.map(callback, thisArg);
  },

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {ArraySlice}
   * @memberof ArrayElement.prototype
   */
  filter: function(callback, thisArg) {
    return new ArraySlice(this.content.filter(callback, thisArg));
  },

  /**
   * @param callback - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns {ArraySlice}
   * @memberof ArrayElement.prototype
   */
  reject: function(callback, thisArg) {
    return this.filter(_.negate(callback), thisArg);
  },

  /**
   * This is a reduce function specifically for Minim arrays and objects. It
   * allows for returning normal values or Minim instances, so it converts any
   * primitives on each step.
   * @memberof MemberElement.prototype
   */
  reduce: function(callback, initialValue) {
    var startIndex;
    var memo;

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
    for (var i = startIndex; i < this.length; i++) {
      var item = this.content[i];

      if (this.primitive() === 'object') {
        memo = refract(callback(memo, item.value, item.key, item, this));
      } else {
        memo = refract(callback(memo, item, i, this));
      }
    }

    return memo;
  },

  /**
   * @callback forEachCallback
   * @param {Element} currentValue
   * @param {NumberElement} index
   */

  /**
   * @param {forEachCallback} - Function to execute for each element
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @memberof ArrayElement.prototype
   */
  forEach: function(callback, thisArg) {
    this.content.forEach(function(item, index) {
      callback(item, refract(index));
    }, thisArg);
  },

  /**
   * @memberof ArrayElement.prototype
   */
  shift: function() {
    return this.content.shift();
  },

  /**
   * @memberof ArrayElement.prototype
   */
  unshift: function(value) {
    this.content.unshift(refract(value));
  },

  /**
   * @memberof ArrayElement.prototype
   */
  push: function(value) {
    this.content.push(refract(value));
    return this;
  },

  /**
   * @memberof ArrayElement.prototype
   */
  add: function(value) {
    this.push(value);
  },

  /**
   * Recusively search all descendents using a condition function.
   * @returns {array[Element]}
   * @memberof ArrayElement.prototype
   */
  findElements: function(condition, givenOptions) {
    var options = givenOptions || {};
    var recursive = !!options.recursive;
    var results = options.results === undefined ? [] : options.results;

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
  },

  /**
   * Recusively search all descendents using a condition function.
   * @returns {ArraySlice}
   * @memberof ArrayElement.prototype
   */
  find: function(condition) {
    return new ArraySlice(this.findElements(condition, {recursive: true}));
  },

  /**
   * @returns {ArraySlice}
   * @memberof ArrayElement.prototype
   */
  findByElement: function(element) {
    return this.find(function(item) {
      return item.element === element;
    });
  },

  /**
   * @returns {ArraySlice}
   * @memberof ArrayElement.prototype
   */
  findByClass: function(className) {
    return this.find(function(item) {
      return item.classes.contains(className);
    });
  },

  /**
   * Search the tree recursively and find the element with the matching ID
   * @returns {Element}
   * @memberof ArrayElement.prototype
   */
  getById: function(id) {
    return this.find(function(item) {
      return item.id.toValue() === id;
    }).first;
  },

  /**
   * Looks for matching children using deep equality
   * @returns {boolean}
   * @memberof ArrayElement.prototype
   */
  contains: function(value) {
    return this.content.some(function (element) {
      return element.equals(value);
    });
  }
}, {}, {
  /**
   * @type number
   * @readonly
   * @memberof ArrayElement.prototype
   */
  length: {
    get: function() {
      return this.content.length;
    }
  },

  /**
   * @type boolean
   * @readonly
   * @memberof ArrayElement.prototype
   */
  isEmpty: {
    get: function() {
      return this.content.length === 0;
    }
  },

  /**
   * Return the first item in the collection
   * @type Element
   * @readonly
   * @memberof ArrayElement.prototype
   */
  first: {
    get: function () {
      return this.getIndex(0);
    },
  },

  /**
   * Return the second item in the collection
   * @type Element
   * @readonly
   * @memberof ArrayElement.prototype
   */
  second: {
    get: function() {
      return this.getIndex(1);
    },
  },

  /**
   * Return the last item in the collection
   * @type Element
   * @readonly
   * @memberof ArrayElement.prototype
   */
  last: {
    get: function() {
      return this.getIndex(this.length - 1);
    },
  },
});

if (typeof Symbol !== 'undefined') {
  ArrayElement.prototype[Symbol.iterator] = function () {
    return this.content[Symbol.iterator]();
  };
}

module.exports = ArrayElement;
