const negate = require('lodash/negate');
const isObject = require('lodash/isObject');

const ArrayElement = require('./array-element');
const MemberElement = require('./member-element');
const ObjectSlice = require('../object-slice');

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
    return this.content.reduce((results, el) => {
      results[el.key.toValue()] = el.value.toValue();
      return results;
    }, {});
  }

  /**
   * @param key
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
   * @param key
   * @returns {MemberElement}
   */
  getMember(name) {
    if (name === undefined) { return undefined; }

    return this.content.find(element => element.key.toValue() === name);
  }

  /**
   * @param key
   */
  remove(name) {
    let removed = null;

    this.content = this.content.filter((item) => {
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
    if (isObject(keyOrObject)) {
      Object.keys(keyOrObject).forEach((objectKey) => {
        this.set(objectKey, keyOrObject[objectKey]);
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

  keys() {
    return this.content.map(item => item.key.toValue());
  }

  values() {
    return this.content.map(item => item.value.toValue());
  }

  /**
   * @returns {boolean}
   */
  hasKey(value) {
    for (let i = 0; i < this.content.length; i += 1) {
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
    return this.content.map(item => [item.key.toValue(), item.value.toValue()]);
  }

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   */
  map(callback, thisArg) {
    return this.content.map(item => callback(item.value, item.key, item), thisArg);
  }

  /**
   * Returns an array containing the truthy results of calling the given transformation with each element of this sequence
   * @param transform - A closure that accepts the value, key and member element of this object as its argument and returns an optional value.
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   * @returns An array of the non-undefined results of calling transform with each element of the array
   */
  compactMap(callback, thisArg) {
    const results = [];

    this.forEach((value, key, member) => {
      const result = callback(value, key, member);

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
    return this.content.forEach(item => callback(item.value, item.key, item), thisArg);
  }
}

module.exports = ObjectElement;
