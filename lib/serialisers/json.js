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
      payload['attributes'] = this.serialiseObject(element.attributes);
    }

    payload['content'] = this.serialiseContent(element.content);

    return payload;
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
    } else if (value.map) {
      return value.map(this.deserialise, this);
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
    if (content instanceof this.namespace.BaseElement) {
      return this.serialise(content);
    } else if (content instanceof KeyValuePair) {
      return {
        'key': this.serialise(content.key),
        'value': this.serialise(content.value)
      };
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
    if (element.element !== element.primitive() || element.element === 'member') {
      return true;
    }

    if (element.attributes.keys().length || element.meta.keys().length) {
      return true;
    }

    return false;
  },

  convertKeyToRefract: function (key, item) {
    if (this.shouldRefract(item)) {
      return this.serialise(item);
    }

    if (item.element === 'array') {
      // This is a plain array, but maybe it contains elements with
      // additional information? Let's see!
      var values = [];

      for (var index = 0; index < item.length; index++) {
        var subItem = item.get(index);

        if (this.shouldRefract(subItem)) {
          values.push(this.serialise(subItem));
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
