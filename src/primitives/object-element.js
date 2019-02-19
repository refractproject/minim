var negate = require('lodash/negate');
var isObject = require('lodash/isObject');

var Element = require('./element');
var ArrayElement = require('./array-element');
var MemberElement = require('./member-element');
var ObjectSlice = require('../object-slice');

/**
 * @class
 *
 * @param content
 * @param meta
 * @param attributes
 */
class ObjectElement extends ArrayElement {
  constructor(content, meta, attributes) {
    super(content || [], meta, attributes);
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
   * @param key
   * @returns {Element}
   */
  get(name) {
    var member = this.getMember(name);

    if (member) {
      return member.value;
    }

    return undefined;
  }

  /**
   * @param key
   * @returns {MemberElement}
   */
  getMember(name) {
    if (name === undefined) { return undefined; }

    return this.content.find(function (element) {
      return element.key.toValue() === name;
    });
  }

  /**
   * @param key
   */
  remove (name) {
    var removed = null;

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
   * @param key
   * @returns {Element}
   */
  getKey(name) {
    var member = this.getMember(name);

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
    if (isObject(keyOrObject)) {
      var self = this;
      Object.keys(keyOrObject).forEach(function(objectKey) {
        self.set(objectKey, keyOrObject[objectKey]);
      });

      return this;
    }

    // Store as key for clarity
    var key = keyOrObject;
    var member = this.getMember(key);

    if (member) {
      member.value = value;
    } else {
      this.content.push(new MemberElement(key, value));
    }

    return this;
  }

  keys() {
    return this.content.map(function(item) {
      return item.key.toValue();
    });
  }

  values() {
    return this.content.map(function(item) {
      return item.value.toValue();
    });
  }

  /**
   * @returns {boolean}
   */
  hasKey(value) {
    for (var i = 0; i < this.content.length; i++) {
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
   * Returns an array containing the truthy results of calling the given transformation with each element of this sequence
   * @param transform - A closure that accepts the value, key and member element of this object as its argument and returns an optional value.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns An array of the non-undefined results of calling transform with each element of the array
   */
  compactMap(callback, thisArg) {
    var results = [];

    this.forEach(function (value, key, member) {
      var result = callback(value, key, member);

      if (result) {
        results.push(result);
      }
    }, thisArg);

    return results;
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
   *
   * @memberof ObjectElement.prototype
   */
  reject(callback, thisArg) {
    return this.filter(negate(callback), thisArg);
  }

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   *
   * @memberof ObjectElement.prototype
   */
  forEach(callback, thisArg) {
    return this.content.forEach(function(item) {
      return callback(item.value, item.key, item);
    }, thisArg);
  }
};

module.exports = ObjectElement;
