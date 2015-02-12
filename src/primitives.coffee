_ = require 'lodash'

class ElementType
  constructor: (@element, @content, @attributes = {}) ->

  elementType: -> @element

  toValue: -> @content

  toRefract: (options = {}) ->
    initial =
      element: @elementType()
      attributes: @attributes
      content: @content
    _.extend(initial, options)

  fromDom: (el) ->
    @attributes = el.attributes
    @content = el.content
    @

  toCompactRefract: (options) ->
    dom = @toRefract(options)
    [dom.element, dom.attributes, dom.content]

  get: -> @content

  set: (@content) -> @

class NullType extends ElementType
  constructor: (attributes) ->
    super 'null', null, attributes

  set: -> new Error 'Cannot set value of null'

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

  toRefract: ->
    super content: @content.map (el) -> el.toRefract()

  toCompactRefract: (options = {}) ->
    compactDoms = @content.map (el) -> el.toCompactRefract()
    [@element, @attributes, compactDoms]

  fromDom: (el) ->
    @attributes = el.attributes
    @content = el.content.map (content) -> convertFromDom content
    @

  get: (index) ->
    return @ unless index?
    @content[index]

  set: (index, val) ->
    @content[index] = convertToType val
    @

  map: (cb) -> @content.map cb

  filter: (cb) ->
    newArray = new ArrayType
    newArray.content =  @content.filter cb
    newArray

  forEach: (cb) -> @content.forEach cb

  length: -> @content.length

class PropertyType extends ElementType
  constructor: (name, val, attributes = {}) ->
    content = convertToType val
    attributes.name = name
    super 'property', content, attributes

  toValue: -> @content.toValue()

  toRefract: ->
    super element: 'property', content: @content.toRefract()

  toCompactRefract: ->
    compactDom = @content.toCompactRefract()
    [@element, @attributes, compactDom]

  fromDom: (el) ->
    @attributes = el.attributes
    @content = convertFromDom el.content
    @

  get: -> @content.get()

  set: (val) ->
    @content = convertToType val
    @

class ObjectType extends ElementType
  constructor: (val = {}, attributes) ->
    content = _.keys(val).map (name) -> new PropertyType name, val[name]
    super 'object', content, attributes

  toValue: ->
    @content.reduce (results, el) ->
      results[el.attributes.name] = el.toValue()
      results
    , {}

  get: (name) ->
    return @ unless name?
    _.first(@content.filter (val) -> val.attributes.name is name)

  set: (name, val) ->
    property = @get name

    unless property
      return @content.push new PropertyType name, val

    property.set val
    @

  keys: -> @content.map (val) -> val.attributes.name

  values: -> @content.map (val) -> val.get()

ObjectType::toRefract = ArrayType::toRefract
ObjectType::toCompactRefract = ArrayType::toCompactRefract
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
  return new StringType().fromDom(el)  if el.element is 'string'
  return new NumberType().fromDom(el)  if el.element is 'number'
  return new BoolType().fromDom(el)  if el.element is 'boolean'
  return new PropertyType().fromDom(el)  if el.element is 'property'
  return new ArrayType().fromDom(el)  if el.element is 'array'
  return new ObjectType().fromDom(el)  if el.element is 'object'
  new NullType().fromDom el

module.exports = {
  NullType
  StringType
  NumberType
  BoolType
  ArrayType
  PropertyType
  ObjectType
  convertFromDom
  convertToType
}
