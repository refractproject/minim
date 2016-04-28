'use strict';

var _ = require('lodash');

module.exports = function(BaseElement, registry) {
  var ArrayElement = BaseElement.extend({
    constructor: function (content, meta, attributes) {
      var convertedContent = (content || []).map(function(value) {
        return registry.toElement(value);
      });
      BaseElement.call(this, convertedContent, meta || {}, attributes || {});
      this.element = 'array';
    },

    primitive: function() {
      return 'array';
    },

    toValue: function() {
      return this.content.map(function(el) {
        return el.toValue();
      });
    },

    toRefract: function() {
      return BaseElement.prototype.toRefract.call(this, {
        content: this.content.map(function(el) {
          return el.toRefract();
        })
      });
    },

    fromRefract: function(doc) {
      return BaseElement.prototype.fromRefract.call(this, doc, {
        content: (doc.content || []).map(function(content) {
          return registry.fromRefract(content);
        })
      });
    },

    get: function(index) {
      return this.content[index];
    },

    /*
     * Helper for returning the value of an item
     * This works for both ArrayElement and ObjectElement instances
     */
    getValue: function(indexOrKey) {
      var item = this.get(indexOrKey);

      if (item) {
        return item.toValue();
      }

      return undefined;
    },

    getIndex: function(index) {
      return this.content[index];
    },

    set: function(index, value) {
      this.content[index] = registry.toElement(value);
      return this;
    },

    map: function(cb) {
      return this.content.map(cb);
    },

    filter: function(condition) {
      var newArray = new ArrayElement();
      newArray.content = this.content.filter(condition);
      return newArray;
    },

    /*
     * This is a reduce function specifically for Minim arrays and objects. It
     * allows for returning normal values or Minim instances, so it converts any
     * primitives on each step.
     */
    reduce: function(fn, givenMemo) {
      var startIndex;
      var memo;

      // Allows for defining a starting value of the reduce
      if (!_.isUndefined(givenMemo)) {
        startIndex = 0;
        memo = registry.toElement(givenMemo);
      } else {
        startIndex = 1;
        // Object Element content items are member elements. Because of this,
        // the memo should start out as the member value rather than the
        // actual member itself.
        memo = this.primitive() === 'object' ? this.first().value : this.first();
      }

      // Sending each function call to the registry allows for passing Minim
      // instances through the function return. This means you can return
      // primitive values or return Minim instances and reduce will still work.
      for (var i = startIndex; i < this.length; i++) {
        var item = this.content[i];

        if (this.primitive() === 'object') {
          memo = registry.toElement(fn(memo, item.value, item.key, item, this));
        } else {
          memo = registry.toElement(fn(memo, item, i, this));
        }
      }

      return memo;
    },

    forEach: function(cb) {
      this.content.forEach(function(item, index) {
        cb(item, registry.toElement(index));
      });
    },

    push: function(value) {
      this.content.push(registry.toElement(value));
      return this;
    },

    add: function(value) {
      this.push(value);
    },

    findElements: function(condition, givenOptions) {
      var options = givenOptions || {};
      var recursive = !!options.recursive;
      var results = options.results === undefined ? [] : options.results;

      // The forEach method for Object Elements returns value, key, and member.
      // This passes those along to the condition function below.
      this.forEach(function(item, keyOrIndex, member) {
        // We use duck-typing here to support any registered class that
        // may contain other elements.
        if (recursive && (item.findElements !== undefined)) {
          item.findElements(condition, {
            results: results,
            recursive: recursive
          });
        }

        if (condition(item, keyOrIndex, member)) {
          results.push(item);
        }
      });

      return results;
    },

    /*
     * Recusively search all descendents using a condition function.
     */
    find: function(condition) {
      var newArray = new ArrayElement();
      newArray.content = this.findElements(condition, {recursive: true});
      return newArray;
    },

    findByElement: function(element) {
      return this.find(function(item) {
        return item.element === element;
      });
    },

    findByClass: function(className) {
      return this.find(function(item) {
        return item.classes.contains(className);
      });
    },

    /*
     * Search all direct descendents using a condition function.
     */
    children: function(condition) {
      var newArray = new ArrayElement();
      newArray.content = this.findElements(condition, {recursive: false});
      return newArray;
    },

    /*
     * Search the tree recursively and find the element with the matching ID
     */
    getById: function(id) {
      return this.find(function(item) {
        return item.id === id;
      }).first();
    },

    /*
     * Return the first item in the collection
     */
    first: function() {
      return this.getIndex(0);
    },

    /*
     * Return the second item in the collection
     */
    second: function() {
      return this.getIndex(1);
    },

    /*
     * Return the last item in the collection
     */
    last: function() {
      return this.getIndex(this.length - 1);
    },

    /*
     * Looks for matching children using deep equality
     */
    contains: function(value) {
      for (var i = 0; i < this.content.length; i++) {
        var item = this.content[i];
        if (_.isEqual(item.toValue(), value)) {
          return true;
        }
      }

      return false;
    }
  }, {}, {
    length: {
      get: function() {
        return this.content.length;
      }
    }
  });

  if (typeof Symbol !== 'undefined') {
    ArrayElement.prototype[Symbol.iterator] = function () {
      return this.content[Symbol.iterator]();
    };
  }

  return ArrayElement;
};
