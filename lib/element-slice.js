'use strict';

var _ = require('lodash');
var uptown = require('uptown');
var refract = require('./refraction').refract;
var createClass = uptown.createClass;

var ElementSlice = createClass({
  // elements: [Element]
  constructor: function (elements) {
    this.elements = elements || [];
  },

  toValue: function () {
    return this.elements.map(function (element) {
      return element.toValue();
    });
  },

  // High Order Functions

  map: function (callback, thisArg) {
    return this.elements.map(callback, thisArg);
  },

  // Filters the element slice
  // Returns a new sub slice
  filter: function (callback, thisArg) {
    return new ElementSlice(this.elements.filter(callback, thisArg));
  },

  forEach: function (callback, thisArg) {
    this.elements.forEach(callback, thisArg);
  },

  reduce: function (callback, initialValue) {
    return this.elements.reduce(callback, initialValue);
  },

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

  shift: function() {
    return this.elements.shift();
  },

  unshift: function(value) {
    this.elements.unshift(refract(value));
  },

  push: function(value) {
    this.elements.push(refract(value));
    return this;
  },

  add: function(value) {
    this.push(value);
  },

  // Accessors

  get: function(index) {
    return this.elements[index];
  },

  getValue: function(index) {
    var element = this.elements[index];

    if (element) {
      return element.toValue();
    }

    return undefined;
  }
}, {}, {
  length: {
    get: function () {
      return this.elements.length;
    }
  },

  isEmpty: {
    get: function() {
      return this.elements.length === 0;
    }
  },

  first: {
    get: function() {
      return this.elements[0];
    }
  },
});

if (typeof Symbol !== 'undefined') {
  ElementSlice.prototype[Symbol.iterator] = function () {
    return this.elements[Symbol.iterator]();
  };
}

module.exports = ElementSlice;
