'use strict';

const _ = require('lodash');

const Element = require('./element');
const ArrayElement = require('./array-element');
const MemberElement = require('./member-element');
const ObjectSlice = require('../object-slice');

/**
 * @param content
 * @param meta
 * @param attributes
 */
class ObjectElement extends ArrayElement {
  constructor(content, meta, attributes) {
    const convertedContent = _.keys(content).map(function(key) {
      return new MemberElement(key, content[key]);
    });

    super(convertedContent, meta, attributes);
    this.element = 'object';
  }

  primitive() {
    return 'object';
  }

  toValue() {
    return this.content.reduce(function(results, el) {
      results[el.key.toValue()] = el.value.toValue();
      return results;
    }, {});
  }

  /**
   * @returns {Element}
   */
  get(name) {
    const member = this.getMember(name);

    if (member) {
      return member.value;
    }

    return undefined;
  }

  /**
   * @returns {MemberElement}
   */
  getMember(name) {
    if (name === undefined) { return undefined; }

    return this.content.find(function (element) {
      return element.key.toValue() === name;
    });
  }

  /**
   */
  remove(name) {
    let removed = null;

    this.content = this.content.filter(function (item) {
      if (item.key.toValue() === name) {
        removed = item;
        return false;
      }

      return true;
    });

    return removed;
  }

  /**
   * @returns {Element}
   */
  getKey(name) {
    const member = this.getMember(name);

    if (member) {
      return member.key;
    }

    return undefined;
  }

  /**
   * Set allows either a key/value pair to be given or an object
   * If an object is given, each key is set to its respective value
   */
  set(keyOrObject, value) {
    if (_.isObject(keyOrObject)) {
      const self = this;
      _.each(_.keys(keyOrObject), function(objectKey) {
        self.set(objectKey, keyOrObject[objectKey]);
      });

      return this;
    }

    // Store as key for clarity
    const key = keyOrObject;
    const member = this.getMember(key);

    if (member) {
      member.value = value;
    } else {
      this.content.push(new MemberElement(key, value));
    }

    return this;
  }

  /**
   */
  keys() {
    return this.content.map(function(item) {
      return item.key.toValue();
    });
  }

  /**
   */
  values() {
    return this.content.map(function(item) {
      return item.value.toValue();
    });
  }

  /**
   * @returns {boolean}
   */
  hasKey(value) {
    for (let i = 0; i < this.content.length; i++) {
      if (this.content[i].key.equals(value)) {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns {array}
   */
  items() {
    return this.content.map(function(item) {
      return [item.key.toValue(), item.value.toValue()];
    });
  }

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   */
  map(callback, thisArg) {
    return this.content.map(function(item) {
      return callback(item.value, item.key, item);
    }, thisArg);
  }

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   *
   * @returns {ObjectSlice}
   */
  filter(callback, thisArg) {
    return new ObjectSlice(this.content).filter(callback, thisArg);
  }

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   *
   * @returns {ObjectSlice}
   */
  reject(callback, thisArg) {
    return this.filter(_.negate(callback), thisArg);
  }

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   */
  forEach(callback, thisArg) {
    return this.content.forEach(function(item) {
      return callback(item.value, item.key, item);
    }, thisArg);
  }
}

module.exports = ObjectElement;
