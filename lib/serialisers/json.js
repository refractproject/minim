'use strict';

var createClass = require('uptown').createClass;
var Namespace = require('../namespace');
var KeyValuePair = require('../key-value-pair');
var Element = require('../primitives/element');

/**
 * @class JSONSerialiser
 *
 * @param {Namespace} namespace
 *
 * @property {Namespace} namespace
 */
module.exports = createClass({
  constructor: function(namespace) {
    this.namespace = namespace || new Namespace();
  },

  /**
   * @param {Element} element
   * @returns {object}
   * @memberof JSONSerialiser.prototype
   */
  serialise: function(element) {
    if (!(element instanceof Element)) {
      throw new TypeError('Given element `' + element + '` is not an Element instance');
    }

    var payload = {
      element: element.element,
    };

    if (element.meta.length > 0) {
      payload['meta'] = this.serialiseObject(element.meta);
    }

    if (element.attributes.length > 0) {
      payload['attributes'] = this.serialiseObject(element.attributes);
    }

    var content = this.serialiseContent(element.content);

    if (content !== undefined) {
      payload['content'] = content;
    }

    return payload;
  },

  /**
   * @param {object}
   * @returns {Element}
   * @memberof JSONSerialiser.prototype
   */
  deserialise: function(value) {
    if (!value.element) {
      throw new Error('Given value is not an object containing an element name');
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

    var content = this.deserialiseContent(value.content);
    if (content !== undefined || element.content === null) {
      element.content = content;
    }

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
      if (content.length === 0) {
        return;
      }

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

  serialiseObject: function(obj) {
    var result = {};

    obj.keys().forEach(function (key) {
      result[key] = this.serialise(obj.get(key));
    }, this);

    return result;
  },

  deserialiseObject: function(from, to) {
    Object.keys(from).forEach(function (key) {
      to.set(key, this.deserialise(from[key]));
    }, this);
  }
});
