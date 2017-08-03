'use strict';

var _ = require('lodash');

var Element = require('./element');
var ArrayElement = require('./array-element');
var MemberElement = require('./member-element');
var ObjectSlice = require('../object-slice');

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

  get: function(name) {
    if (name === undefined) { return undefined; }

    var member = _.first(
      this.content.filter(function(item) {
        return item.key.toValue() === name;
      })
    ) || {};

    return member.value;
  },

  getMember: function(name) {
    if (name === undefined) { return undefined; }

    return _.first(
      this.content.filter(function(item) {
        return item.key.toValue() === name;
      })
    );
  },

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

  getKey: function(name) {
    var member = this.getMember(name);

    if (member) {
      return member.key;
    }

    return undefined;
  },

  /*
   * Set allows either a key/value pair to be given or an object
   * If an object is given, each key is set to its respective value
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
      this.push(new MemberElement(key, value));
    }

    return this;
  },

  keys: function() {
    return this.content.map(function(item) {
      return item.key.toValue();
    });
  },

  values: function() {
    return this.content.map(function(item) {
      return item.value.toValue();
    });
  },

  hasKey: function(value) {
    for (var i = 0; i < this.content.length; i++) {
      if (this.content[i].key.equals(value)) {
        return true;
      }
    }

    return false;
  },

  items: function() {
    return this.content.map(function(item) {
      return [item.key.toValue(), item.value.toValue()];
    });
  },

  map: function(cb) {
    return this.content.map(function(item) {
      return cb(item.value, item.key, item);
    });
  },

  filter: function(callback, thisArg) {
    return new ObjectSlice(this.content).filter(callback, thisArg);
  },

  forEach: function(cb) {
    return this.content.forEach(function(item) {
      return cb(item.value, item.key, item);
    });
  }
});

module.exports = ObjectElement;
