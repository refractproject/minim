'use strict';

var createClass = require('uptown').createClass;
var Namespace = require('../namespace');
var KeyValuePair = require('../key-value-pair');

module.exports = createClass({
  constructor: function(namespace) {
    this.namespace = namespace || new Namespace();
  },

  serialise: function(element) {
    var payload = {
      element: element.element,
    };

    if (element.meta.length > 0) {
      payload['meta'] = this.serialiseObject(element.meta);
    }

    if (element.attributes.length > 0) {
      var attributes = element.attributes;

      // Meta attribute was renamed to metadata
      if (attributes.get('metadata')) {
        attributes = attributes.clone();
        attributes.set('meta', attributes.get('metadata'));
        attributes.remove('metadata');
      }

      payload['attributes'] = this.serialiseObject(attributes);
    }

    if (this[element.element + 'SerialiseContent']) {
      payload['content'] = this[element.element + 'SerialiseContent'](element, payload);
    } else if (element.content !== undefined) {
      payload['content'] = this.serialiseContent(element.content);
    }

    return payload;
  },

  refSerialiseContent: function(element, payload) {
    delete payload['attributes'];

    return {
      href: element.toValue(),
      path: element.path.toValue(),
    };
  },

  sourceMapSerialiseContent: function(element) {
    return element.toValue();
  },

  dataStructureSerialiseContent: function(element) {
    return [this.serialiseContent(element.content)];
  },

  deserialise: function(value) {
    if (typeof value === 'string') {
      return new this.namespace.elements.String(value);
    } else if (typeof value === 'number') {
      return new this.namespace.elements.Number(value);
    } else if (typeof value === 'boolean') {
      return new this.namespace.elements.Boolean(value);
    } else if (value === null) {
      return new this.namespace.elements.Null();
    } else if (Array.isArray(value)) {
      return new this.namespace.elements.Array(value.map(this.deserialise, this));
    }

    var ElementClass = this.namespace.getElementClass(value.element);
    var element = new ElementClass();

    if (element.element !== value.element) {
      element.element = value.element;
    }

    if (value.meta) {
      this.deserialiseObject(value.meta, element.meta);
    }

    if (value.attributes) {
      this.deserialiseObject(value.attributes, element.attributes);
    }

    element.content = this.deserialiseContent(value.content);

    return element;
  },

  // Private API

  serialiseContent: function(content) {
    if (content instanceof this.namespace.Element) {
      return this.serialise(content);
    } else if (content instanceof KeyValuePair) {
      var pair = {
        'key': this.serialise(content.key),
      };

      if (content.value) {
        pair['value'] = this.serialise(content.value);
      }

      return pair;
    } else if (content && content.map) {
      return content.map(this.serialise, this);
    }

    return content;
  },

  deserialiseContent: function(content) {
    if (content) {
      if (content.element) {
        return this.deserialise(content);
      } else if (content.key) {
        var pair = new KeyValuePair(this.deserialise(content.key));

        if (content.value) {
          pair.value = this.deserialise(content.value);
        }

        return pair;
      } else if (content.map) {
        return content.map(this.deserialise, this);
      }
    }

    return content;
  },

  shouldRefract: function (element) {
    if (element.attributes.keys().length || element.meta.keys().length) {
      return true;
    }

    if (element.element === 'enum') {
      // enum elements are treated like primitives (array)
      return false;
    }

    if (element.element !== element.primitive() || element.element === 'member') {
      return true;
    }

    return false;
  },

  convertKeyToRefract: function (key, item) {
    if (this.shouldRefract(item)) {
      return this.serialise(item);
    }

    if (item.element === 'enum') {
      return this.serialiseEnum(item);
    }

    if (item.element === 'array') {
      // This is a plain array, but maybe it contains elements with
      // additional information? Let's see!
      var values = [];

      for (var index = 0; index < item.length; index++) {
        var subItem = item.get(index);

        if (this.shouldRefract(subItem) || key === 'default') {
          values.push(this.serialise(subItem));
        } else if (subItem.element === 'array' || subItem.element === 'enum') {
          // items for array or enum inside array are always serialised
          var self = this;
          var value = subItem.children.map(function(subSubItem) {
            return self.serialise(subSubItem);
          });
          values.push(value);
        } else {
          values.push(subItem.toValue());
        }
      }

      return values;
    }

    if (item.element === 'object') {
      // This is an object, so we need to check if it's members contain
      // additional information
      // TODO
    }

    return item.toValue();
  },

  serialiseEnum: function(element) {
    var self = this;

    return element.children.map(function(item) {
      return self.serialise(item);
    });
  },

  serialiseObject: function(obj) {
    var result = {};

    obj.keys().forEach(function (key) {
      result[key] = this.convertKeyToRefract(key, obj.get(key));
    }, this);

    return result;
  },

  deserialiseObject: function(from, to) {
    Object.keys(from).forEach(function (key) {
      to.set(key, this.deserialise(from[key]));
    }, this);
  }
});
