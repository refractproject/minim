/**
 * @class JSONSerialiser
 *
 * @param {Namespace} namespace
 *
 * @property {Namespace} namespace
 */
class JSONSerialiser {
  constructor(namespace) {
    this.namespace = namespace || new this.Namespace();
  }

  /**
   * @param {Element} element
   * @returns {object}
   */
  serialise(element) {
    if (!(element instanceof this.namespace.elements.Element)) {
      throw new TypeError('Given element `' + element + '` is not an Element instance');
    }

    var payload = {
      element: element.element,
    };

    if (element._meta && element._meta.length > 0) {
      payload.meta = this.serialiseObject(element.meta);
    }

    if (element._attributes && element._attributes.length > 0) {
      payload.attributes = this.serialiseObject(element.attributes);
    }

    var content = this.serialiseContent(element.content);

    if (content !== undefined) {
      payload.content = content;
    }

    return payload;
  }

  /**
   * @param {object} value
   * @returns {Element}
   */
  deserialise(value) {
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
  }

  // Private API

  serialiseContent(content) {
    if (content instanceof this.namespace.elements.Element) {
      return this.serialise(content);
    } else if (content instanceof this.namespace.KeyValuePair) {
      var pair = {
        key: this.serialise(content.key),
      };

      if (content.value) {
        pair.value = this.serialise(content.value);
      }

      return pair;
    } else if (content && content.map) {
      if (content.length === 0) {
        return;
      }

      return content.map(this.serialise, this);
    }

    return content;
  }

  deserialiseContent(content) {
    if (content) {
      if (content.element) {
        return this.deserialise(content);
      } else if (content.key) {
        var pair = new this.namespace.KeyValuePair(this.deserialise(content.key));

        if (content.value) {
          pair.value = this.deserialise(content.value);
        }

        return pair;
      } else if (content.map) {
        return content.map(this.deserialise, this);
      }
    }

    return content;
  }

  serialiseObject(obj) {
    var result = {};

    obj.keys().forEach(function (key) {
      var value = obj.get(key);

      if (value) {
        result[key] = this.serialise(value);
      }
    }, this);

    return result;
  }

  deserialiseObject(from, to) {
    Object.keys(from).forEach(function (key) {
      to.set(key, this.deserialise(from[key]));
    }, this);
  }
}


module.exports = JSONSerialiser;
