'use strict';

var _ = require('lodash');
var ArraySlice = require('./array-slice');

/**
 * @class
 * @extends ArraySlice
 */
class ObjectSlice extends ArraySlice {
  map(callback, thisArg) {
    return this.elements.map(function(member) {
      return callback(member.value, member.key, member);
    }, thisArg);
  }

  filter(callback, thisArg) {
    return new ObjectSlice(this.elements.filter(function(member) {
      return callback(member.value, member.key, member);
    }, thisArg));
  }

  reject(callback, thisArg) {
    return this.filter(_.negate(callback, thisArg));
  }

  forEach(callback, thisArg) {
    return this.elements.forEach(function(member, index) {
      return callback(member.value, member.key, member, index);
    }, thisArg);
  }

  /**
   * @returns {array}
   * @memberof ObjectSlice.prototype
   */
  keys () {
    return this.map(function(value, key) {
      return key.toValue();
    });
  }

  /**
   * @returns {array}
   * @memberof ObjectSlice.prototype
   */
   values() {
    return this.map(function(value) {
      return value.toValue();
    });
  }
}

module.exports = ObjectSlice;
