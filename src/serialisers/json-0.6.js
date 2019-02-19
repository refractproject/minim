var JSONSerialiser = require('./json');

module.exports = class JSONSerialiser06 extends JSONSerialiser {
  serialise(element) {
    if (!(element instanceof this.namespace.elements.Element)) {
      throw new TypeError('Given element `' + element + '` is not an Element instance');
    }

    var variable;
    if (element._attributes && element.attributes.get('variable')) {
      variable = element.attributes.get('variable');
    }

    var payload = {
      element: element.element,
    };

    if (element._meta && element._meta.length > 0) {
      payload.meta = this.serialiseObject(element.meta);
    }

    var isEnum = (element.element === 'enum' || element.attributes.keys().indexOf('enumerations') !== -1);

    if (isEnum) {
      var attributes = this.enumSerialiseAttributes(element);

      if (attributes) {
        payload.attributes = attributes;
      }
    } else if (element._attributes && element._attributes.length > 0) {
      var attributes = element.attributes;

      // Meta attribute was renamed to metadata
      if (attributes.get('metadata')) {
        attributes = attributes.clone();
        attributes.set('meta', attributes.get('metadata'));
        attributes.remove('metadata');
      }

      if (element.element === 'member' && variable) {
        attributes = attributes.clone();
        attributes.remove('variable');
      }

      if (attributes.length > 0) {
        payload.attributes = this.serialiseObject(attributes);
      }
    }

    if (isEnum) {
      payload.content = this.enumSerialiseContent(element, payload);
    } else if (this[element.element + 'SerialiseContent']) {
      payload.content = this[element.element + 'SerialiseContent'](element, payload);
    } else if (element.content !== undefined) {
      var content;

      if (variable && element.content.key) {
        content = element.content.clone();
        content.key.attributes.set('variable', variable);
        content = this.serialiseContent(content);
      } else {
        content = this.serialiseContent(element.content);
      }

      if (this.shouldSerialiseContent(element, content)) {
        payload.content = content;
      }
    }

    return payload;
  }

  shouldSerialiseContent(element, content) {
    if (content === undefined) {
      return false;
    }

    if (element.element === 'parseResult' || element.element === 'httpRequest'
        || element.element === 'httpResponse' || element.element === 'category'
        || element.element === 'link') {
      return true;
    }

    if (Array.isArray(content) && content.length === 0) {
      return false;
    }

    return true;
  }

  refSerialiseContent(element, payload) {
    delete payload.attributes;

    return {
      href: element.toValue(),
      path: element.path.toValue(),
    };
  }

  sourceMapSerialiseContent(element) {
    return element.toValue();
  }

  dataStructureSerialiseContent(element) {
    return [this.serialiseContent(element.content)];
  }

  enumSerialiseAttributes(element) {
    var attributes = element.attributes.clone();

    // Enumerations attribute was is placed inside content (see `enumSerialiseContent` below)
    var enumerations = attributes.remove('enumerations') || new this.namespace.elements.Array([]);

    // Remove fixed type attribute from samples and default
    var defaultValue = attributes.get('default');
    var samples = attributes.get('samples') || new this.namespace.elements.Array([]);

    if (defaultValue && defaultValue.content) {
      defaultValue.content.attributes.remove('typeAttributes');
      // Wrap default in array (not sure it is really needed because tests pass without this line)
      attributes.set('default', new this.namespace.elements.Array([defaultValue.content]));
    }

    samples.forEach(function (sample) {
      sample.content.attributes.remove('typeAttributes');
    });

    // Content -> Samples
    if (element.content && enumerations.length !== 0) {
      // If we don't have enumerations, content should stay in
      // content (enumerations) as per Drafter 3 behaviour.
      samples.unshift(element.content);
    }

    samples = samples.map(function (sample) {
      return new this.namespace.elements.Array([sample.content]);
    }, this);

    if (samples.length) {
      attributes.set('samples', samples);
    }

    if (attributes.length > 0) {
      return this.serialiseObject(attributes);
    }
  }

  enumSerialiseContent(element) {
    // In API Elements < 1.0, the content is the enumerations
    // If we don't have an enumerations, use the value (Drafter 3 behaviour)

    if (element._attributes) {
      var enumerations = element.attributes.get('enumerations');

      if (enumerations && enumerations.length > 0) {
        return enumerations.content.map(function (enumeration) {
          var element = enumeration.clone();
          element.attributes.remove('typeAttributes');
          return this.serialise(element);
        }, this);
      }
    }

    if (element.content) {
      var value = element.content.clone();
      value.attributes.remove('typeAttributes');
      return [this.serialise(value)];
    }

    return [];
  }

  deserialise(value) {
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

    var content = this.deserialiseContent(value.content);
    if (content !== undefined || element.content === null) {
      element.content = content;
    }

    if (element.element === 'enum') {
      // Grab enumerations from content
      if (element.content) {
        element.attributes.set('enumerations', element.content);
      }

      // Unwrap the sample value (inside double array)
      var samples = element.attributes.get('samples');
      element.attributes.remove('samples');

      if (samples) {
        // Re-wrap samples from array of array to array of enum's

        var existingSamples = samples;

        samples = new this.namespace.elements.Array();
        existingSamples.forEach(function (sample) {
          sample.forEach(function (sample) {
            var enumElement = new ElementClass(sample);
            enumElement.element = element.element;
            samples.push(enumElement);
          });
        });

        var sample = samples.shift();

        if (sample) {
          element.content = sample.content;
        } else {
          element.content = undefined;
        }

        element.attributes.set('samples', samples);
      } else {
        element.content = undefined;
      }

      // Unwrap the default value
      var defaultValue = element.attributes.get('default');
      if (defaultValue && defaultValue.length > 0) {
        defaultValue = defaultValue.get(0);
        var defaultElement = new ElementClass(defaultValue);
        defaultElement.element = element.element;
        element.attributes.set('default', defaultElement);
      }
    } else if (element.element === 'dataStructure' && Array.isArray(element.content)) {
      element.content = element.content[0];
    } else if (element.element === 'category') {
      // "meta" attribute has been renamed to metadata
      var metadata = element.attributes.get('meta');

      if (metadata) {
        element.attributes.set('metadata', metadata);
        element.attributes.remove('meta');
      }
    } else if (element.element === 'member' && element.key && element.key._attributes && element.key._attributes.getValue('variable')) {
      element.attributes.set('variable', element.key.attributes.get('variable'));
      element.key.attributes.remove('variable');
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

  shouldRefract(element) {
    if ((element._attributes && element.attributes.keys().length) || (element._meta && element.meta.keys().length)) {
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
  }

  convertKeyToRefract(key, item) {
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

      for (var index = 0; index < item.length; index += 1) {
        var subItem = item.get(index);

        if (this.shouldRefract(subItem) || key === 'default') {
          values.push(this.serialise(subItem));
        } else if (subItem.element === 'array' || subItem.element === 'object' || subItem.element === 'enum') {
          // items for array or enum inside array are always serialised
          var self = this;
          var value = subItem.children.map(function (subSubItem) {
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
      var values = [];
      var content = item.content || [];

      for (var index = 0; index < content.length; index += 1) {
        values.push(this.serialise(content[index]));
      }

      return values;
    }

    return item.toValue();
  }

  serialiseEnum(element) {
    var self = this;

    return element.children.map(function (item) {
      return self.serialise(item);
    });
  }

  serialiseObject(obj) {
    var result = {};

    obj.keys().forEach(function (key) {
      var value = obj.get(key);

      if (value) {
        result[key] = this.convertKeyToRefract(key, value);
      }
    }, this);

    return result;
  }

  deserialiseObject(from, to) {
    Object.keys(from).forEach(function (key) {
      to.set(key, this.deserialise(from[key]));
    }, this);
  }
};
