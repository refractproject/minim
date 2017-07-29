'use strict';

var _ = require('lodash');
var ElementSlice = require('./element-slice');

var ObjectSlice = ElementSlice.extend({
  map: function(callback, thisArg) {
    return this.elements.map(function(member) {
      return callback(member.value, member.key, member);
    }, thisArg);
  },

  filter: function(callback, thisArg) {
    return new ObjectSlice(this.elements.filter(function(member) {
      return callback(member.value, member.key, member);
    }, thisArg));
  },

  forEach: function(callback, thisArg) {
    return this.elements.forEach(function(member, index) {
      return callback(member.value, member.key, member, index);
    }, thisArg);
  },

  keys: function() {
    return this.map(function(value, key) {
      return key.toValue();
    });
  },

  values: function() {
    return this.map(function(value) {
      return value.toValue();
    });
  },
});

module.exports = ObjectSlice;
