'use strict';

var _ = require('lodash');
var refract = require('../refraction').refract;
var Element = require('./element');
var ElementSlice = require('../element-slice');

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

  get: function(index) {
    return this.content[index];
  },

  /*
   * Helper for returning the value of an item
   * This works for both ArrayElement and ObjectElement instances
   */
  getValue: function(indexOrKey) {
    var item = this.get(indexOrKey);

    if (item) {
      return item.toValue();
    }

    return undefined;
  },

  getIndex: function(index) {
    return this.content[index];
  },

  set: function(index, value) {
    this.content[index] = refract(value);
    return this;
  },

  remove: function (index) {
    var removed = this.content.splice(index, 1);

    if (removed.length) {
      return removed[0];
    }

    return null;
  },

  map: function(callback, thisArg) {
    return this.content.map(callback, thisArg);
  },

  filter: function(callback, thisArg) {
    return new ElementSlice(this.content.filter(callback, thisArg));
  },

  /*
   * This is a reduce function specifically for Minim arrays and objects. It
   * allows for returning normal values or Minim instances, so it converts any
   * primitives on each step.
   */
  reduce: function(callback, initialValue) {
    var startIndex;
    var memo;

    // Allows for defining a starting value of the reduce
    if (!_.isUndefined(initialValue)) {
      startIndex = 0;
      memo = refract(initialValue);
    } else {
      startIndex = 1;
      // Object Element content items are member elements. Because of this,
      // the memo should start out as the member value rather than the
      // actual member itself.
      memo = this.primitive() === 'object' ? this.first().value : this.first();
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

  forEach: function(callback, thisArg) {
    this.content.forEach(function(item, index) {
      callback(item, refract(index));
    }, thisArg);
  },

  shift: function() {
    return this.content.shift();
  },

  unshift: function(value) {
    this.content.unshift(refract(value));
  },

  push: function(value) {
    this.content.push(refract(value));
    return this;
  },

  add: function(value) {
    this.push(value);
  },

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

  /*
   * Recusively search all descendents using a condition function.
   */
  find: function(condition) {
    var newArray = new ArrayElement();
    newArray.content = this.findElements(condition, {recursive: true});
    return newArray;
  },

  findByElement: function(element) {
    return this.find(function(item) {
      return item.element === element;
    });
  },

  findByClass: function(className) {
    return this.find(function(item) {
      return item.classes.contains(className);
    });
  },

  /*
   * Search the tree recursively and find the element with the matching ID
   */
  getById: function(id) {
    return this.find(function(item) {
      return item.id.toValue() === id;
    }).first();
  },

  /*
   * Return the first item in the collection
   */
  first: function() {
    return this.getIndex(0);
  },

  /*
   * Return the second item in the collection
   */
  second: function() {
    return this.getIndex(1);
  },

  /*
   * Return the last item in the collection
   */
  last: function() {
    return this.getIndex(this.length - 1);
  },

  /*
   * Looks for matching children using deep equality
   */
  contains: function(value) {
    for (var i = 0; i < this.content.length; i++) {
      var item = this.content[i];
      if (_.isEqual(item.toValue(), value)) {
        return true;
      }
    }

    return false;
  }
}, {}, {
  length: {
    get: function() {
      return this.content.length;
    }
  },

  isEmpty: {
    get: function() {
      return this.content.length === 0;
    }
  }
});

if (typeof Symbol !== 'undefined') {
  ArrayElement.prototype[Symbol.iterator] = function () {
    return this.content[Symbol.iterator]();
  };
}

module.exports = ArrayElement;
