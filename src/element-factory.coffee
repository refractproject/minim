class ElementFactory
  @elementMap = {}

  @build: (type, args...) ->
    elementClass = @elementMap[type]
    throw new Error "No element registered for type '#{type}'." unless type and elementClass
    new elementClass(args...)


  @clear: ->
    (@elementMap = {}) and @


  @register: (type, elementClass) ->
    throw new Error "Type '#{type}' already registered." if @elementMap[type]
    throw new Error 'Both type and class arguments must exist.' unless type and elementClass
    @elementMap[type] = elementClass


module.exports = ElementFactory
