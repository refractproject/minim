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

  getProperty: -> new ErrorType 'Element does not have method getProperty', @

  has: -> false

  map: -> new ErrorType 'Element does not have method map', @

  filter: -> new ErrorType 'Element does not have method filter', @

  forEach: -> new ErrorType 'Element does not have method forEach', @

  length: -> new ErrorType 'Element does not have method length', @

  push: -> new ErrorType 'Element does not have method push', @

  add: -> new ErrorType 'Element does not have method add', @

  find: -> new ErrorType 'Element does not have method find', @

  keys: -> new ErrorType 'Element does not have method keys', @

  values: -> new ErrorType 'Element does not have method values', @

class ErrorType
  constructor: (@message = 'Unspecified error', @element) ->

  elementType: -> 'error'

  get: -> @

  set: -> @

  getProperty: -> @

  has: -> false

  map: -> @

  filter: -> @

  forEach: -> @

  length: -> @

  push: -> @

  add: -> @

  find: -> @

  keys: -> @

  values: -> @

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

class Collection extends ElementType
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
    item = @content[index]
    return new ErrorType "Index #{index} does not exist", @ unless item
    item

  set: (index, val) ->
    @content[index] = convertToType val
    @

  map: (cb) -> @content.map cb

  filter: (cond) ->
    newArray = new ArrayType
    newArray.content =  @content.filter cond
    newArray

  forEach: (cb) -> @content.forEach cb

  length: -> @content.length

  push: (val) ->
    @content.push convertToType(val)
    @

  add: (val) -> @push val

  findElements: (cond, results = []) ->
    @content.forEach (el) ->
      el.findElements(cond, results) if el.elementType() in ['array', 'object']
      results.push(el.content) if el.elementType() is 'property' and cond(el.content)
      results.push(el) if cond(el)
    results

  find: (cond) ->
    newArray = new ArrayType
    newArray.content = @findElements cond
    newArray

class ArrayType extends Collection
  constructor: (vals = [], attributes) ->
    content = vals.map (val) -> convertToType val
    super 'array', content, attributes

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

class Item extends Collection
  constructor: (val = {}, attributes) ->
    content = _.keys(val).map (name) -> new PropertyType name, val[name]
    super 'object', content, attributes

  toValue: ->
    @content.reduce (results, el) ->
      results[el.attributes.name] = el.toValue()
      results
    , {}

  getProperty: (name) ->
    _.first(@content.filter (val) -> val.attributes.name is name)

  get: (name) ->
    return @ unless name?
    property = @getProperty(name)
    return new ErrorType "Property #{name} does not exist", @ unless property
    property.get()

  set: (name, val) ->
    property = @getProperty name

    if property
      property.set val
    else
      @content.push new PropertyType name, val
    @

  has: (name) ->
    return true for property in @content when property.attributes.name is name
    false

  keys: -> @content.map (val) -> val.attributes.name

  values: -> @content.map (val) -> val.get()

class ObjectType extends Item

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
  ElementType
  ErrorType
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
