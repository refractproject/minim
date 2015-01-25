var _ = require('lodash');

var ElementType = function(typeName, val, meta) {
  this.element = typeName;
  this.meta = meta || {};
  this.content = val;
};

ElementType.prototype.elementType = function() {
  return this.element;
};

ElementType.prototype.toValue = function() {
  return this.content;
};

ElementType.prototype.toDom = function(options) {
  var initial = {
    element: this.elementType(),
    meta: this.meta,
    content: this.content
  };
  options = options || {};
  return _.extend(initial, options);
};

ElementType.prototype.fromDOM = function(el) {
  this.meta = el.meta;
  this.content = el.content;
  return this;
};

var NullType = function(meta) {
  ElementType.call(this, 'null', null, meta);
};

NullType.prototype = Object.create(ElementType.prototype);
NullType.prototype.constructor = NullType;

var StringType = function(val, meta) {
  ElementType.call(this, 'string', val, meta);
};

StringType.prototype = Object.create(ElementType.prototype);
StringType.prototype.constructor = StringType;

var NumberType = function(val, meta) {
  ElementType.call(this, 'number', val, meta);
};

NumberType.prototype = Object.create(ElementType.prototype);
NumberType.prototype.constructor = NumberType;

var BoolType = function(val, meta) {
  ElementType.call(this, 'boolean', val, meta);
};

BoolType.prototype = Object.create(ElementType.prototype);
BoolType.prototype.constructor = BoolType;

var ArrayType = function(vals, meta) {
  vals = vals || [];
  var content = vals.map(function(val) {
    return convertToType(val);
  });
  ElementType.call(this, 'array', content, meta);
};

ArrayType.prototype = Object.create(ElementType.prototype);
ArrayType.prototype.constructor = ArrayType;

ArrayType.prototype.toValue = function() {
  return this.content.map(function(el) {
    return el.toValue();
  });
};

ArrayType.prototype.toDom = function() {
  return ElementType.prototype.toDom.call(this, {
    content: this.content.map(function(el) {
      return el.toDom();
    })
  });
};

ArrayType.prototype.fromDOM = function(el) {
  this.meta = el.meta;
  this.content = el.content.map(function(content) {
    return convertFromDom(content);
  });
  return this;
};

var KeyValueType = function(name, val, meta) {
  var content = convertToType(val);
  meta = meta || {};
  meta.name = name;
  ElementType.call(this, 'keyValue', content, meta);
};

KeyValueType.prototype = Object.create(ElementType.prototype);
KeyValueType.prototype.constructor = KeyValueType;

KeyValueType.prototype.toValue = function() {
  return this.content.toValue();
};

KeyValueType.prototype.toDom = function() {
  return ElementType.prototype.toDom.call(this, {
    element: 'keyValue',
    content: this.content.toDom()
  });
};

KeyValueType.prototype.fromDOM = function(el) {
  this.meta = el.meta;
  this.content = convertFromDom(el.content);
  return this;
};

var ObjectType = function(val, meta) {
  val = val || {};
  var content = _.keys(val).map(function(key) {
    return new KeyValueType(key, val[key]);
  });
  ElementType.call(this, 'object', content, meta);
};

ObjectType.prototype = Object.create(ElementType.prototype);
ObjectType.prototype.constructor = ObjectType;

ObjectType.prototype.toValue = function() {
  var results = {};

  this.content.forEach(function(el) {
    results[el.meta.name] = el.toValue();
  });

  return results;
};

ObjectType.prototype.toDom = ArrayType.prototype.toDom;
ObjectType.prototype.fromDOM = ArrayType.prototype.fromDOM;

// TODO: This needs to be a register so future types can be added
var convertToType = function(val) {
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

// TODO: This needs to be a register so future types can be added
var convertFromDom = function(el) {
  if (el.element == 'string') {
    return new StringType().fromDOM(el);
  }

  if (el.element == 'number') {
    return new NumberType().fromDOM(el);
  }

  if (el.element == 'boolean') {
    return new BoolType().fromDOM(el);
  }

  if (el.element == 'keyValue') {
    return new KeyValueType().fromDOM(el);
  }

  if (el.element == 'array') {
    return new ArrayType().fromDOM(el);
  }

  if (el.element == 'object') {
    return new ObjectType().fromDOM(el);
  }

  return new NullType().fromDOM(el);
};

module.exports = {
  NullType: NullType,
  StringType: StringType,
  NumberType: NumberType,
  BoolType: BoolType,
  ArrayType: ArrayType,
  KeyValueType: KeyValueType,
  ObjectType: ObjectType,
  convertToType: convertToType,
  convertFromDom: convertFromDom
};
