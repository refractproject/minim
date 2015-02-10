var ArrayType, BoolType, ElementType, KeyValueType, NullType, NumberType, ObjectType, StringType, convertFromDom, convertToType, _,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

_ = require('lodash');

ElementType = (function() {
  function ElementType(_at_element, _at_content, _at_attributes) {
    this.element = _at_element;
    this.content = _at_content;
    this.attributes = _at_attributes != null ? _at_attributes : {};
  }

  ElementType.prototype.elementType = function() {
    return this.element;
  };

  ElementType.prototype.toValue = function() {
    return this.content;
  };

  ElementType.prototype.toDom = function(options) {
    var initial;
    if (options == null) {
      options = {};
    }
    initial = {
      element: this.elementType(),
      attributes: this.attributes,
      content: this.content
    };
    return _.extend(initial, options);
  };

  ElementType.prototype.fromDom = function(el) {
    this.attributes = el.attributes;
    this.content = el.content;
    return this;
  };

  ElementType.prototype.toCompactDom = function(options) {
    var dom;
    dom = this.toDom(options);
    return [dom.element, dom.attributes, dom.content];
  };

  return ElementType;

})();

NullType = (function(_super) {
  __extends(NullType, _super);

  function NullType(attributes) {
    NullType.__super__.constructor.call(this, 'null', null, attributes);
  }

  return NullType;

})(ElementType);

StringType = (function(_super) {
  __extends(StringType, _super);

  function StringType(val, attributes) {
    StringType.__super__.constructor.call(this, 'string', val, attributes);
  }

  return StringType;

})(ElementType);

NumberType = (function(_super) {
  __extends(NumberType, _super);

  function NumberType(val, attributes) {
    NumberType.__super__.constructor.call(this, 'number', val, attributes);
  }

  return NumberType;

})(ElementType);

BoolType = (function(_super) {
  __extends(BoolType, _super);

  function BoolType(val, attributes) {
    BoolType.__super__.constructor.call(this, 'boolean', val, attributes);
  }

  return BoolType;

})(ElementType);

ArrayType = (function(_super) {
  __extends(ArrayType, _super);

  function ArrayType(vals, attributes) {
    var content;
    if (vals == null) {
      vals = [];
    }
    content = vals.map(function(val) {
      return convertToType(val);
    });
    ArrayType.__super__.constructor.call(this, 'array', content, attributes);
  }

  ArrayType.prototype.toValue = function() {
    return this.content.map(function(el) {
      return el.toValue();
    });
  };

  ArrayType.prototype.toDom = function() {
    return ArrayType.__super__.toDom.call(this, {
      content: this.content.map(function(el) {
        return el.toDom();
      })
    });
  };

  ArrayType.prototype.toCompactDom = function(options) {
    var compactDoms;
    if (options == null) {
      options = {};
    }
    compactDoms = this.content.map(function(el) {
      return el.toCompactDom();
    });
    return [this.element, this.attributes, compactDoms];
  };

  ArrayType.prototype.fromDom = function(el) {
    this.attributes = el.attributes;
    this.content = el.content.map(function(content) {
      return convertFromDom(content);
    });
    return this;
  };

  return ArrayType;

})(ElementType);

KeyValueType = (function(_super) {
  __extends(KeyValueType, _super);

  function KeyValueType(key, val, attributes) {
    var content;
    if (attributes == null) {
      attributes = {};
    }
    content = convertToType(val);
    attributes.key = key;
    KeyValueType.__super__.constructor.call(this, 'keyValue', content, attributes);
  }

  KeyValueType.prototype.toValue = function() {
    return this.content.toValue();
  };

  KeyValueType.prototype.toDom = function() {
    return KeyValueType.__super__.toDom.call(this, {
      element: 'keyValue',
      content: this.content.toDom()
    });
  };

  KeyValueType.prototype.toCompactDom = function() {
    var compactDom;
    compactDom = this.content.toCompactDom();
    return [this.element, this.attributes, compactDom];
  };

  KeyValueType.prototype.fromDom = function(el) {
    this.attributes = el.attributes;
    this.content = convertFromDom(el.content);
    return this;
  };

  return KeyValueType;

})(ElementType);

ObjectType = (function(_super) {
  __extends(ObjectType, _super);

  function ObjectType(val, attributes) {
    var content;
    if (val == null) {
      val = {};
    }
    content = _.keys(val).map(function(key) {
      return new KeyValueType(key, val[key]);
    });
    ObjectType.__super__.constructor.call(this, 'object', content, attributes);
  }

  ObjectType.prototype.toValue = function() {
    return this.content.reduce(function(results, el) {
      results[el.attributes.key] = el.toValue();
      return results;
    }, {});
  };

  return ObjectType;

})(ElementType);

ObjectType.prototype.toDom = ArrayType.prototype.toDom;

ObjectType.prototype.toCompactDom = ArrayType.prototype.toCompactDom;

ObjectType.prototype.fromDom = ArrayType.prototype.fromDom;

convertToType = function(val) {
  if (_.isString(val)) {
    return new StringType(val);
  }
  if (_.isNumber(val)) {
    return new NumberType(val);
  }
  if (_.isBoolean(val)) {
    return new BoolType(val);
  }
  if (_.isArray(val)) {
    return new ArrayType(val);
  }
  if (_.isObject(val)) {
    return new ObjectType(val);
  }
  return new NullType();
};

convertFromDom = function(el) {
  if (el.element === "string") {
    return new StringType().fromDom(el);
  }
  if (el.element === "number") {
    return new NumberType().fromDom(el);
  }
  if (el.element === "boolean") {
    return new BoolType().fromDom(el);
  }
  if (el.element === "keyValue") {
    return new KeyValueType().fromDom(el);
  }
  if (el.element === "array") {
    return new ArrayType().fromDom(el);
  }
  if (el.element === "object") {
    return new ObjectType().fromDom(el);
  }
  return new NullType().fromDom(el);
};

module.exports = {
  NullType: NullType,
  StringType: StringType,
  NumberType: NumberType,
  BoolType: BoolType,
  ArrayType: ArrayType,
  KeyValueType: KeyValueType,
  ObjectType: ObjectType,
  convertFromDom: convertFromDom,
  convertToType: convertToType
};
