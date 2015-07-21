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

    toCompactRefract: function() {
      var attributes = this.convertAttributesToRefract('toCompactRefract');
      var compactDoms = this.content.map(function(el) {
        return el.toCompactRefract();
      });
      return [this.element, this.meta.toValue(), attributes, compactDoms];
    },

    fromRefract: function(doc) {
      this.meta = doc.meta;
      this.attributes = doc.attributes;
      this.content = (doc.content || []).map(function(content) {
        return registry.fromRefract(content);
      });

      this.convertAttributesToElements(function(attribute) {
        return registry.fromRefract(attribute);
      });

      if (this.element !== doc.element) {
        this.element = doc.element;
      }

      return this;
    },

    fromCompactRefract: function(tuple) {
      this.meta = tuple[1];
      this.attributes = tuple[2];
      this.content = (tuple[3] || []).map(function(content) {
        return registry.fromCompactRefract(content);
      });

      this.convertAttributesToElements(function(attribute) {
        return registry.fromCompactRefract(attribute);
      });

      if (this.element !== tuple[0]) {
        this.element = tuple[0];
      }

      return this;
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

    forEach: function(cb) {
      this.content.forEach(cb);
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

      this.content.forEach(function(el) {
        // We use duck-typing here to support any registered class that
        // may contain other elements.
        if (recursive && (el.findElements !== undefined)) {
          el.findElements(condition, {
            results: results,
            recursive: recursive
          });
        }
        if (condition(el)) {
          results.push(el);
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
        return item.class.contains(className);
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
      return this.get(0);
    },

    /*
     * Return the second item in the collection
     */
    second: function() {
      return this.get(1);
    },

    /*
     * Return the last item in the collection
     */
    last: function() {
      return this.get(this.length - 1);
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

  return ArrayElement;
};
