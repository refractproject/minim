_ = require 'lodash'

class ElementType
  constructor: (@element, @content, @attributes = {}) ->

  elementType: -> @element

  toValue: -> @content

  toDom: (options = {}) ->
    initial =
      element: @elementType()
      attributes: @attributes
      content: @content
    _.extend(initial, options)

  fromDom: (el) ->
    @attributes = el.attributes
    @content = el.content
    @

  toCompactDom: (options) ->
    dom = @toDom(options)
    [dom.element, dom.attributes, dom.content]

class NullType extends ElementType
  constructor: (attributes) ->
    super 'null', null, attributes

class StringType extends ElementType
  constructor: (val, attributes) ->
    super 'string', val, attributes

class NumberType extends ElementType
  constructor: (val, attributes) ->
    super 'number', val, attributes

class BoolType extends ElementType
  constructor: (val, attributes) ->
    super 'boolean', val, attributes

class ArrayType extends ElementType
  constructor: (vals = [], attributes) ->
    content = vals.map (val) -> convertToType val
    super 'array', content, attributes

  toValue: -> @content.map (el) -> el.toValue()

  toDom: ->
    super content: @content.map (el) -> el.toDom()

  toCompactDom: (options = {}) ->
    compactDoms = @content.map (el) -> el.toCompactDom()
    [@element, @attributes, compactDoms]

  fromDom: (el) ->
    @attributes = el.attributes
    @content = el.content.map (content) -> convertFromDom content
    @

class KeyValueType extends ElementType
  constructor: (key, val, attributes = {}) ->
    content = convertToType val
    attributes.key = key
    super 'keyValue', content, attributes

  toValue: -> @content.toValue()

  toDom: ->
    super element: 'keyValue', content: @content.toDom()

  toCompactDom: ->
    compactDom = @content.toCompactDom()
    [@element, @attributes, compactDom]

  fromDom: (el) ->
    @attributes = el.attributes
    @content = convertFromDom el.content
    @

class ObjectType extends ElementType
  constructor: (val = {}, attributes) ->
    content = _.keys(val).map (key) -> new KeyValueType key, val[key]
    super 'object', content, attributes

  toValue: ->
    @content.reduce (results, el) ->
      results[el.attributes.key] = el.toValue()
      results
    , {}

ObjectType::toDom = ArrayType::toDom
ObjectType::toCompactDom = ArrayType::toCompactDom
ObjectType::fromDom = ArrayType::fromDom

# TODO: This needs to be a register so future types can be added
convertToType = (val) ->
  return new StringType(val)  if _.isString(val)
  return new NumberType(val)  if _.isNumber(val)
  return new BoolType(val)  if _.isBoolean(val)
  return new ArrayType(val)  if _.isArray(val)
  return new ObjectType(val)  if _.isObject(val)
  new NullType()

# TODO: This needs to be a register so future types can be added
convertFromDom = (el) ->
  return new StringType().fromDom(el)  if el.element is "string"
  return new NumberType().fromDom(el)  if el.element is "number"
  return new BoolType().fromDom(el)  if el.element is "boolean"
  return new KeyValueType().fromDom(el)  if el.element is "keyValue"
  return new ArrayType().fromDom(el)  if el.element is "array"
  return new ObjectType().fromDom(el)  if el.element is "object"
  new NullType().fromDom el

module.exports = {
  NullType
  StringType
  NumberType
  BoolType
  ArrayType
  KeyValueType
  ObjectType
  convertFromDom
  convertToType
}
