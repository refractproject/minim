'use strict';

const _ = require('lodash');
const ArraySlice = require('./array-slice');

/**
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
   */
  keys () {
    return this.map(function(value, key) {
      return key.toValue();
    });
  }

  /**
   * @returns {array}
   */
  values() {
    return this.map(function(value) {
      return value.toValue();
    });
  }
}

module.exports = ObjectSlice;
