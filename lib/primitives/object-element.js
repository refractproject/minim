'use strict';

var _ = require('lodash');

module.exports = function(BaseElement, ArrayElement, MemberElement) {
  var ObjectElement = ArrayElement.extend({
    constructor: function (content, meta, attributes) {
      var convertedContent = _.keys(content).map(function(key) {
        return new MemberElement(key, content[key]);
      });
      BaseElement.call(this, convertedContent, meta, attributes);
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
        this.content.push(new MemberElement(key, value));
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

    filter: function(cb) {
      // Create a new object with new member elements
      var obj = new ObjectElement([], this.meta, this.attributes);
      obj.content = this.content.filter(function(item) {
        return cb(item.value, item.key, item);
      });
      return obj;
    },

    forEach: function(cb) {
      return this.content.forEach(function(item) {
        return cb(item.value, item.key, item);
      });
    }
  });

  return ObjectElement;
};
