'use strict';

var _ = require('lodash');

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
 *
 * @extends ArrayElement
 */
var ObjectElement = ArrayElement.extend({
  constructor: function (content, meta, attributes) {
    var convertedContent = _.keys(content).map(function(key) {
      return new MemberElement(key, content[key]);
    });
    Element.call(this, convertedContent, meta, attributes);
    this.element = 'object';
  },

  primitive: function() {
    return 'object';
  },

  toValue: function() {
    return this.content.reduce(function(results, el) {
      results[el.key.toValue()] = el.value.toValue();
      return results;
    }, {});
  },

  /**
   * @returns {Element}
   * @memberof ObjectElement.prototype
   */
  get: function(name) {
    var member = this.getMember(name);

    if (member) {
      return member.value;
    }

    return undefined;
  },

  /**
   * @returns {MemberElement}
   * @memberof ObjectElement.prototype
   */
  getMember: function(name) {
    if (name === undefined) { return undefined; }

    return this.content.find(function (element) {
      return element.key.toValue() === name;
    });
  },

  /**
   * @memberof ObjectElement.prototype
   */
  remove: function (name) {
    var removed = null;

    this.content = this.content.filter(function (item) {
      if (item.key.toValue() === name) {
        removed = item;
        return false;
      }

      return true;
    });

    return removed;
  },

  /**
   * @returns {Element}
   * @memberof ObjectElement.prototype
   */
  getKey: function(name) {
    var member = this.getMember(name);

    if (member) {
      return member.key;
    }

    return undefined;
  },

  /**
   * Set allows either a key/value pair to be given or an object
   * If an object is given, each key is set to its respective value
   *
   * @memberof ObjectElement.prototype
   */
  set: function(keyOrObject, value) {
    if (_.isObject(keyOrObject)) {
      var self = this;
      _.each(_.keys(keyOrObject), function(objectKey) {
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
  },

  /**
   * @memberof ObjectElement.prototype
   */
  keys: function() {
    return this.content.map(function(item) {
      return item.key.toValue();
    });
  },

  /**
   * @memberof ObjectElement.prototype
   */
  values: function() {
    return this.content.map(function(item) {
      return item.value.toValue();
    });
  },

  /**
   * @returns {boolean}
   * @memberof ObjectElement.prototype
   */
  hasKey: function(value) {
    for (var i = 0; i < this.content.length; i++) {
      if (this.content[i].key.equals(value)) {
        return true;
      }
    }

    return false;
  },

  /**
   * @returns {array}
   * @memberof ObjectElement.prototype
   */
  items: function() {
    return this.content.map(function(item) {
      return [item.key.toValue(), item.value.toValue()];
    });
  },

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   *
   * @memberof ObjectElement.prototype
   */
  map: function(callback, thisArg) {
    return this.content.map(function(item) {
      return callback(item.value, item.key, item);
    }, thisArg);
  },

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   *
   * @returns {ObjectSlice}
   *
   * @memberof ObjectElement.prototype
   */
  filter: function(callback, thisArg) {
    return new ObjectSlice(this.content).filter(callback, thisArg);
  },

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   *
   * @returns {ObjectSlice}
   *
   * @memberof ObjectElement.prototype
   */
  reject: function(callback, thisArg) {
    return this.filter(_.negate(callback), thisArg);
  },

  /**
   * @param callback
   * @param thisArg - Value to use as this (i.e the reference Object) when executing callback
   *
   * @memberof ObjectElement.prototype
   */
  forEach: function(callback, thisArg) {
    return this.content.forEach(function(item) {
      return callback(item.value, item.key, item);
    }, thisArg);
  }
});

module.exports = ObjectElement;
