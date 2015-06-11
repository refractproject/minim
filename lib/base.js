'use strict';

var _ = require('lodash');
var ElementType;

/*
 * A refract element implementation with an extensible type registry.
 *
 * The type registry allows you to register your own classes to be instantiated
 * when a particular refract element is encountered, and allows you to specify
 * which elements get instantiated for existing Javascript objects.
 */

function TypeRegistry() {
  this.elementMap = {};
  this.typeDetection = [];
}

_.extend(TypeRegistry.prototype, {
  /*
   * Register a new element class for an element type.
   */
  register: function(name, ElementClass) {
    this.elementMap[name] = ElementClass;
    return this;
  },

  /*
   * Unregister a previously registered class for an element type.
   */
  unregister: function(name) {
    delete this.elementMap[name];
    return this;
  },

  /*
   * Add a new detection function to determine which element
   * class to use when converting existing js instances into
   * refract element types.
   */
  detect: function(test, ElementClass, givenPrepend) {
    var prepend = givenPrepend === undefined ? true : givenPrepend;

    if (prepend) {
      this.typeDetection.unshift([test, ElementClass]);
    } else {
      this.typeDetection.push([test, ElementClass]);
    }

    return this;
  },

  /*
   * Convert an existing Javascript object into refract type instances, which
   * can be further processed or serialized into refract or compact refract.
   * If the item passed in is already refracted, then it is returned
   * unmodified.
   */
  toType: function(value) {
    if (value instanceof ElementType) { return value; }

    var element;

    for(var i = 0; i < this.typeDetection.length; i++) {
      var test = this.typeDetection[i][0];
      var ElementClass = this.typeDetection[i][1];

      if (test(value)) {
        element = new ElementClass(value);
        break;
      }
    }

    return element;
  },

  /*
   * Get an element class given an element type name.
   */
  getElementClass: function(element) {
    var ElementClass = this.elementMap[element];

    if (ElementClass === undefined) {
      // Fall back to the base element. We may not know what
      // to do with the `content`, but downstream software
      // may know.
      return ElementType;
    }

    return ElementClass;
  },

  /*
   * Convert a long-form refract DOM into refract type instances.
   */
   fromRefract: function(dom) {
    var ElementClass = this.getElementClass(dom.element);
    return new ElementClass().fromRefract(dom);
  },

  /*
   * Convert a compact refract tuple into refract type instances.
   */
  fromCompactRefract: function(tuple) {
    var ElementClass = this.getElementClass(tuple[0]);
    return new ElementClass().fromCompactRefract(tuple);
  }
});

// Initiate a default Minim registry
var registry = new TypeRegistry();

function Meta(meta) {
  var self = this;
  self.meta = meta || {};

  _.keys(meta).forEach(function(key) {
    self.meta[key] = registry.toType(meta[key]);
  });
}

_.extend(Meta.prototype, {
  toObject: function() {
    var self = this;
    var meta = {};

    _.forEach(_.keys(self.meta), function(key) {
      meta[key] = self.meta[key].toValue();
    });

    return meta;
  },

  getProperty: function(name, value) {
    if (!this.meta[name]) {
      this.meta[name] = registry.toType(value);
    }

    return this.meta[name];
  },

  setProperty: function(name, value) {
    this.meta[name] = registry.toType(value);
  }
});

Object.defineProperty(Meta.prototype, 'id', {
  get: function() {
    return this.getProperty('id', '');
  },
  set: function(element) {
    this.setProperty('id', element);
  }
});

Object.defineProperty(Meta.prototype, 'class', {
  get: function() {
    return this.getProperty('class', []);
  },
  set: function(element) {
    this.setProperty('id', element);
  }
});

Object.defineProperty(Meta.prototype, 'name', {
  get: function() {
    return this.getProperty('name', '');
  },
  set: function(element) {
    this.setProperty('name', element);
  }
});

Object.defineProperty(Meta.prototype, 'title', {
  get: function() {
    return this.getProperty('title', '');
  },
  set: function(element) {
    this.setProperty('title', element);
  }
});

Object.defineProperty(Meta.prototype, 'description', {
  get: function() {
    return this.getProperty('description', '');
  },
  set: function(element) {
    this.setProperty('description', element);
  }
});

/*
 * ElementType is the base element from which all other elements are built.
 * It has no specific information about how to handle the content, but is
 * able to convert to and from Refract/Javascript.
 */

ElementType = function(content, meta, attributes) {
  this.meta = new Meta(meta || {});
  this.attributes = attributes || {};
  this.content = content || null;
  this._attributeElementKeys = [];
};

_.extend(ElementType.prototype, {
  primitive: function() {
    return;
  },

  toValue: function() {
    return this.content;
  },

  toRefract: function(options) {
    var attributes = this.convertAttributesToRefract('toRefract');
    var initial = {
      element: this.element,
      meta: this.meta.toObject(),
      attributes: attributes,
      content: this.content
    };
    return _.extend(initial, options || {});
  },

  toCompactRefract: function() {
    var attributes = this.convertAttributesToRefract('toCompactRefract');
    return [this.element, this.meta.toObject(), attributes, this.content];
  },

  /*
   * Some attributes may be elements. This is domain-specific knowledge, so
   * a subclass *MUST* define the attribute element names to convert. This
   * method handles the actual serialization to refract.
   */
  convertAttributesToRefract: function(functionName) {
    var attributes = {};
    var keys = _.keys(this.attributes);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (this._attributeElementKeys.indexOf(key) !== -1) {
        attributes[key] = this.attributes[key][functionName]();
      } else {
        attributes[key] = this.attributes[key];
      }
    }

    return attributes;
  },

  /*
   * Some attributes may be elements. This is domain-specific knowledge, so
   * a subclass *MUST* define the attribute element names to convert. This
   * method handles the actual conversion when loading.
   */
  convertAttributesToElements: function(conversionFunc) {
    for (var i = 0; i < this._attributeElementKeys.length; i++) {
      var key = this._attributeElementKeys[i];

      if (this.attributes[key]) {
        this.attributes[key] = conversionFunc(this.attributes[key]);
      }
    }
  },

  fromRefract: function(dom) {
    this.meta = new Meta(dom.meta);
    this.attributes = dom.attributes;
    this.content = dom.content;

    this.convertAttributesToElements(function(attribute) {
      return registry.fromRefract(attribute);
    });

    if (this.element !== dom.element) {
      this.element = dom.element;
    }

    return this;
  },

  fromCompactRefract: function(tuple) {
    this.meta = new Meta(tuple[1]);
    this.attributes = tuple[2];
    this.content = tuple[3];

    this.convertAttributesToElements(function(attribute) {
      registry.fromCompactRefract(attribute);
    });

    if (this.element !== tuple[0]) {
      this.element = tuple[0];
    }

    return this;
  },

  set: function(content) {
    this.content = content;
    return this;
  },

  equals: function(value) {
    return _.isEqual(this.toValue(), value);
  }
});

Object.defineProperty(ElementType.prototype, 'element', {
  get: function() {
    // Returns 'element' so we don't have undefined as element
    return this._storedElement || 'element';
  },
  set: function(element) {
    this._storedElement = element;
  }
});

function NullType() {
  ElementType.apply(this, arguments);
  this.element = 'null';
}

NullType.prototype = _.create(ElementType.prototype, {
  primitive: function() {
    return 'null';
  },

  set: function() {
    return new Error('Cannot set the value of null');
  }
});

function StringType() {
  ElementType.apply(this, arguments);
  this.element = 'string';
}

StringType.prototype = _.create(ElementType.prototype, {
  primitive: function() {
    return 'string';
  }
});

// TODO: Add tests
Object.defineProperty(StringType.prototype, 'length', {
  get: function() {
    return this.content.length;
  }
});

function NumberType() {
  ElementType.apply(this, arguments);
  this.element = 'number';
}

NumberType.prototype = _.create(ElementType.prototype, {
  primitive: function() {
    return 'number';
  }
});

function BooleanType() {
  ElementType.apply(this, arguments);
  this.element = 'boolean';
}

BooleanType.prototype = _.create(ElementType.prototype, {
  primitive: function() {
    return 'boolean';
  }
});

function Collection() {
  ElementType.apply(this, arguments);
}

// TODO: Iterators for ES5
// get [Symbol.iterator]() {
//   return this.content[Symbol.iterator];
// }
Collection.prototype = _.create(ElementType.prototype, {
  toValue: function() {
    return this.content.map(function(el) {
      return el.toValue();
    });
  },

  toRefract: function() {
    return ElementType.prototype.toRefract.call(this, {
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
    return [this.element, this.meta.toObject(), attributes, compactDoms];
  },

  fromRefract: function(dom) {
    this.meta = new Meta(dom.meta);
    this.attributes = dom.attributes;
    this.content = (dom.content || []).map(function(content) {
      return registry.fromRefract(content);
    });

    this.convertAttributesToElements(function(attribute) {
      return registry.fromRefract(attribute);
    });

    if (this.element !== dom.element) {
      this.element = dom.element;
    }

    return this;
  },

  fromCompactRefract: function(tuple) {
    this.meta = new Meta(tuple[1]);
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

  set: function(index, value) {
    this.content[index] = registry.toType(value);
    return this;
  },

  map: function(cb) {
    return this.content.map(cb);
  },

  filter: function(condition) {
    var newArray = new Collection();
    newArray.content = this.content.filter(condition);
    return newArray;
  },

  forEach: function(cb) {
    this.content.forEach(cb);
  },

  push: function(value) {
    this.content.push(registry.toType(value));
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
    var newArray = new Collection();
    newArray.content = this.findElements(condition, {recursive: true});
    return newArray;
  },

  /*
   * Search all direct descendents using a condition function.
   */
  children: function(condition) {
    var newArray = new Collection();
    newArray.content = this.findElements(condition, {recursive: false});
    return newArray;
  },

  /*
   * Search the tree recursively and find the element with the matching ID
   */
  getById: function(id) {
    return this.find(function(item) {
      return item.meta.id.toValue() === id;
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
});

Object.defineProperty(Collection.prototype, 'length', {
  get: function() {
    return this.content.length;
  }
});

function ArrayType(content, meta, attributes) {
  var convertedContent = (content || []).map(function(value) {
    return registry.toType(value);
  });
  Collection.call(this, convertedContent, meta || {}, attributes || {});
  this.element = 'array';
}

ArrayType.prototype = _.create(Collection.prototype, {
  primitive: function() {
    return 'array';
  }
});

function MemberType(key, value, meta, attributes) {
  var content = {
    key: registry.toType(key),
    value: registry.toType(value)
  };

  ElementType.call(this, content, meta, attributes);
  this.element = 'member';
}

MemberType.prototype = _.create(ElementType.prototype, {
  toRefract: function() {
    return {
      element: this.element,
      attributes: this.attributes,
      meta: this.meta.toObject(),
      content: {
        key: this.key.toRefract(),
        value: this.value.toRefract()
      }
    };
  },

  toCompactRefract: function() {
    return [this.element, this.meta.toObject(), this.attributes, {
      key: this.key.toCompactRefract(),
      value: this.value.toCompactRefract()
    }];
  },

  fromRefract: function(dom) {
    this.meta = new Meta(dom.meta);
    this.attributes = dom.attributes;
    this.content = {
      key: registry.fromRefract(dom.content.key),
      value: registry.fromRefract(dom.content.value)
    };

    this.convertAttributesToElements(function(attribute) {
      return registry.fromRefract(attribute);
    });

    if (this.element !== dom.element) {
      this.element = dom.element;
    }

    return this;
  },

  fromCompactRefract: function(tuple) {
    this.meta = new Meta(tuple[1]);
    this.attributes = tuple[2];
    this.content = {
      key: registry.fromCompactRefract(tuple[3].key),
      value: registry.fromCompactRefract(tuple[3].value)
    };

    this.convertAttributesToElements(function(attribute) {
      return registry.fromCompactRefract(attribute);
    });

    if (this.element !== tuple[0]) {
      this.element = tuple[0];
    }

    return this;
  }
});

Object.defineProperty(MemberType.prototype, 'key', {
  get: function() {
    return this.content.key;
  },
  set: function(key) {
    this.content.key = registry.toType(key);
  }
});

Object.defineProperty(MemberType.prototype, 'value', {
  get: function() {
    return this.content.value;
  },
  set: function(value) {
    this.content.value = registry.toType(value);
  }
});

function ObjectType(content, meta, attributes) {
  var convertedContent = _.keys(content).map(function(key) {
    return new MemberType(key, content[key]);
  });
  Collection.call(this, convertedContent, meta, attributes);
  this.element = 'object';
}

ObjectType.prototype = _.create(Collection.prototype, {
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

  set: function(name, value) {
    var member = this.getMember(name);

    if (member) {
      member.value = value;
    } else {
      this.content.push(new MemberType(name, value));
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
    var obj = new ObjectType([], this.meta, this.attributes);
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

module.exports = {
  Meta: Meta,
  ElementType: ElementType,
  NullType: NullType,
  StringType: StringType,
  NumberType: NumberType,
  BooleanType: BooleanType,
  Collection: Collection,
  ArrayType: ArrayType,
  MemberType: MemberType,
  ObjectType: ObjectType,
  TypeRegistry: TypeRegistry,
  registry: registry
};
