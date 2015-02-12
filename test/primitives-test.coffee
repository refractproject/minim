mocha = require 'mocha'
chai = require 'chai'
expect = chai.expect
minim = require '../src/primitives'

describe 'Minim Primitives', ->
  describe 'convertToType', ->
    typeCheck = (name, val) ->
      returnedType = undefined

      context 'when given '+name, ->
        before ->
          returnedType = minim.convertToType(val)

        it 'returns '+name, ->
          expect(returnedType.elementType()).to.equal name

    typeCheck('null', null)
    typeCheck('string', 'foobar')
    typeCheck('number', 1)
    typeCheck('boolean', true)
    typeCheck('array', [1, 2, 3])
    typeCheck('object', { foo: 'bar' })

  describe 'convertFromType', ->
    typeCheck = (name, el) ->
      context 'when given '+name, ->
        returnedType = undefined

        before ->
          returnedType = minim.convertFromDom el

        it 'returns '+name+' element', ->
          expect(returnedType.elementType()).to.equal name

        it 'has the correct value', ->
          expect(returnedType.toValue()).to.equal el.content

    typeCheck 'null',
      element: 'null'
      attributes: {}
      content: null

    typeCheck 'string',
      element: 'string'
      attributes: {}
      content: 'foo'

    typeCheck 'number',
      element: 'number'
      attributes: {}
      content: 4

    typeCheck 'boolean',
      element: 'boolean'
      attributes: {}
      content: true

    context 'when give property', ->
      returnedType = undefined
      el = undefined

      # { foo: 'bar' }
      el =
        element: 'property'
        attributes:
          name: 'foo'
        content:
          element: 'string'
          attributes: {}
          content: 'bar'

      before ->
        returnedType = minim.convertFromDom el

      it 'returns property element', ->
        expect(returnedType.elementType()).to.equal 'property'

      it 'has the correct value', ->
        expect(returnedType.toValue()).to.equal el.content.content

      it 'has the right attributes', ->
        expect(returnedType.attributes).to.deep.equal el.attributes

    context 'when give array', ->
      returnedType = undefined
      el = undefined

      # [1, 2]
      el =
        element: 'array'
        attributes: {}
        content: [
          element: 'number'
          attributes: {}
          content: 1
        ,
          element: 'number'
          attributes: {}
          content: 2
         ]

      before ->
        returnedType = minim.convertFromDom el

      it 'returns array element', ->
        expect(returnedType.elementType()).to.equal 'array'

      it 'has the correct values', ->
        expect(returnedType.toValue()).to.deep.equal [ 1, 2 ]

    context 'when give array', ->
      returnedType = undefined
      el = undefined

      # { foo: 'bar', z: 2 }
      el =
        element: 'object'
        attributes: {}
        content: [
          element: 'property'
          attributes:
            name: 'foo'
          content:
            element: 'string'
            attributes: {}
            content: 'bar'
        ,
          element: 'property'
          attributes:
            name: 'z'
          content:
            element: 'number'
            attributes: {}
            content: 2
         ]

      before ->
        returnedType = minim.convertFromDom el

      it 'returns array element', ->
        expect(returnedType.elementType()).to.equal 'object'

      it 'has the correct values', ->
        expect(returnedType.toValue()).to.deep.equal
          foo: 'bar'
          z: 2

  describe 'NullType', ->
    nullType = undefined

    before ->
      nullType = new minim.NullType()

    describe '#elementType', ->
      it 'is null', ->
        expect(nullType.elementType()).to.equal 'null'

    describe '#toValue', ->
      it 'returns null', ->
        expect(nullType.toValue()).to.equal null

    describe '#toRefract', ->
      expected =
        element: 'null'
        attributes: {}
        content: null

      it 'returns a null DOM object', ->
        expect(nullType.toRefract()).to.deep.equal expected

    describe '#toCompactRefract', ->
      expected = ['null', {}, null]

      it 'returns a null Compact DOM object', ->
        expect(nullType.toCompactRefract()).to.deep.equal expected

    describe '#get', ->
      it 'returns the null value', ->
        expect(nullType.get()).to.equal null

    describe '#set', ->
      it 'cannot set the value', ->
        expect(nullType.set('foobar')).to.be.an.instanceof Error

  describe 'StringType', ->
    stringType = undefined

    before ->
      stringType = new minim.StringType('foobar')

    describe '#elementType', ->
      it 'is a boolean', ->
        expect(stringType.elementType()).to.equal 'string'

    describe '#toValue', ->
      it 'returns the string', ->
        expect(stringType.toValue()).to.equal 'foobar'

    describe '#toRefract', ->
      expected =
        element: 'string'
        attributes: {}
        content: 'foobar'

      it 'returns a string DOM object', ->
        expect(stringType.toRefract()).to.deep.equal expected

    describe '#toCompactRefract', ->
      expected = ['string', {}, 'foobar']
      it 'returns a string Compact DOM object', ->
        expect(stringType.toCompactRefract()).to.deep.equal expected

    describe '#get', ->
      it 'returns the string value', ->
        expect(stringType.get()).to.equal 'foobar'

    describe '#set', ->
      it 'sets the value of the string', ->
        stringType.set('hello world')
        expect(stringType.get()).to.equal 'hello world'

  describe 'NumberType', ->
    numberType = undefined

    before ->
      numberType = new minim.NumberType(4)

    describe '#elementType', ->
      it 'is a boolean', ->
        expect(numberType.elementType()).to.equal 'number'

    describe '#toValue', ->
      it 'returns the number', ->
        expect(numberType.toValue()).to.equal 4

    describe '#toRefract', ->
      expected =
        element: 'number'
        attributes: {}
        content: 4

      it 'returns a number DOM object', ->
        expect(numberType.toRefract()).to.deep.equal expected

    describe '#toCompactRefract', ->
      expected = ['number', {}, 4]

      it 'returns a number Compact DOM object', ->
        expect(numberType.toCompactRefract()).to.deep.equal expected

    describe '#get', ->
      it 'returns the number value', ->
        expect(numberType.get()).to.equal 4

    describe '#set', ->
      it 'sets the value of the number', ->
        numberType.set(10)
        expect(numberType.get()).to.equal 10

  describe 'BoolType', ->
    boolType = undefined

    before ->
      boolType = new minim.BoolType(true)

    describe '#elementType', ->
      it 'is a boolean', ->
        expect(boolType.elementType()).to.equal 'boolean'

    describe '#toValue', ->
      it 'returns the boolean', ->
        expect(boolType.toValue()).to.equal true

    describe '#toRefract', ->
      expected =
        element: 'boolean'
        attributes: {}
        content: true

      it 'returns a boolean DOM object', ->
        expect(boolType.toRefract()).to.deep.equal expected

    describe '#toCompactRefract', ->
      expected = ['boolean', {}, true]

      it 'returns a boolean Compact DOM object', ->
        expect(boolType.toCompactRefract()).to.deep.equal expected

    describe '#get', ->
      it 'returns the boolean value', ->
        expect(boolType.get()).to.equal true

    describe '#set', ->
      it 'sets the value of the boolean', ->
        boolType.set(false)
        expect(boolType.get()).to.equal false

  describe 'ArrayType', ->
    arrayType = undefined

    setArray = ->
      arrayType = new minim.ArrayType(['a', true, null, 1 ])

    before -> setArray()
    beforeEach -> setArray()

    describe '.content', ->
      correctTypes = undefined
      storedTypes = undefined

      before ->
        correctTypes = ['string', 'boolean', 'null', 'number']
        storedTypes = arrayType.content.map (el) -> el.elementType()

      it 'stores the correct types', ->
        expect(storedTypes).to.deep.equal correctTypes

    describe '#elementType', ->
      it 'is an array', ->
        expect(arrayType.elementType()).to.equal 'array'

    describe '#toValue', ->
      it 'returns the array', ->
        expect(arrayType.toValue()).to.deep.equal ['a', true, null, 1]

    describe '#toRefract', ->
      expected =
        element: 'array'
        attributes: {}
        content: [
          element: 'string'
          attributes: {}
          content: 'a'
        ,
          element: 'boolean'
          attributes: {}
          content: true
        ,
          element: 'null'
          attributes: {}
          content: null
        ,
          element: 'number'
          attributes: {}
          content: 1
         ]

      it 'returns an array DOM object', ->
        expect(arrayType.toRefract()).to.deep.equal expected

    describe '#toCompactRefract', ->
      expected = ['array', {}, [['string', {}, 'a'],
                                ['boolean', {}, true],
                                ['null', {}, null],
                                ['number', {}, 1]]]
      it 'returns an array Compact DOM object', ->
        expect(arrayType.toCompactRefract()).to.deep.equal expected

    describe '#get', ->
      context 'when an index is given', ->
        it 'returns the item from the array', ->
          expect(arrayType.get(0).get()).to.equal 'a'

      context 'when no index is given', ->
        it 'returns itself', ->
          expect(arrayType.get().get(0).get()).to.equal 'a'

    describe '#set', ->
      it 'sets the value of the array', ->
        arrayType.set(0, 'hello world')
        expect(arrayType.get(0).get()).to.equal 'hello world'

    describe '#map', ->
      it 'allows for mapping the content of the array', ->
        newArray = arrayType.map (item) -> item.get()
        expect(newArray).to.deep.equal ['a', true, null, 1]

    describe '#filter', ->
      it 'allows for filtering the content', ->
        newArray = arrayType.filter (item) -> item.get() in ['a', 1]
        expect(newArray.toValue()).to.deep.equal ['a', 1]

    describe '#forEach', ->
      it 'iterates over each item', ->
        results = []
        arrayType.forEach (item) -> results.push item
        expect(results.length).to.equal 4

    describe '#length', ->
      it 'returns the length of the content', ->
        expect(arrayType.length()).to.equal 4

    describe '#push', ->
      it 'adds a new item to the array', ->
        arrayType.push 'foobar'
        expect(arrayType.length()).to.equal 5
        expect(arrayType.get(4).toValue()).to.equal 'foobar'

  describe 'PropertyType', ->
    propertyType = undefined
    before ->
      propertyType = new minim.PropertyType('foo', 'bar')

    describe '.attributes', ->
      it 'has the correct name', ->
        propertyType.attributes.name = 'foo'

    describe '#elementType', ->
      it 'is a property type', ->
        expect(propertyType.elementType()).to.equal 'property'

    describe '#toValue', ->
      it 'returns the string type', ->
        expect(propertyType.toValue()).to.equal 'bar'

    describe '#toRefract', ->
      expected =
        element: 'property'
        attributes:
          name: 'foo'

        content:
          element: 'string'
          attributes: {}
          content: 'bar'

      it 'returns a property type DOM object', ->
        expect(propertyType.toRefract()).to.deep.equal expected

    describe '#toCompactRefract', ->
      expected = ['property', {name: 'foo'}, ['string', {}, 'bar']]

      it 'returns a PropertyType Compact DOM object', ->
        expect(propertyType.toCompactRefract()).to.deep.equal expected

    describe '#get', ->
      it 'returns the value and name', ->
        expect(propertyType.get()).to.equal 'bar'

    describe '#set', ->
      it 'sets the value of the property', ->
        propertyType.set('hello world')
        expect(propertyType.get()).to.equal 'hello world'

  describe 'ObjectType', ->
    objectType = undefined

    setObject = ->
      objectType = new minim.ObjectType
        foo: 'bar'
        z: 1

    before -> setObject()
    beforeEach -> setObject()

    describe '.content', ->
      correctTypes = undefined
      storedTypes = undefined

      before ->
        correctTypes = [ 'string', 'number' ]
        storedTypes = objectType.content.map (el) ->
          el.content.elementType()

      it 'has the correct types', ->
        expect(storedTypes).to.deep.equal correctTypes

    describe '#elementType', ->
      it 'is a string type', ->
        expect(objectType.elementType()).to.equal 'object'

    describe '#toValue', ->
      it 'returns the object', ->
        expect(objectType.toValue()).to.deep.equal
          foo: 'bar'
          z: 1

    describe '#toRefract', ->
      expected =
        element: 'object'
        attributes: {}
        content: [
          element: 'property'
          attributes:
            name: 'foo'
          content:
            element: 'string'
            attributes: {}
            content: 'bar'
        ,
          element: 'property'
          attributes:
            name: 'z'
          content:
            element: 'number'
            attributes: {}
            content: 1
         ]

      it 'returns an object DOM object', ->
        expect(objectType.toRefract()).to.deep.equal expected

    describe '#toCompactRefract', ->
      expected = ['object', {}, [['property', {name: 'foo'}, ['string', {}, 'bar']],
                                 ['property', {name: 'z'}, ['number', {}, 1 ]]]]

      it 'returns a object Compact DOM object', ->
        expect(objectType.toCompactRefract()).to.deep.equal expected

    describe '#get', ->
      context 'when a property name is given', ->
        it 'returns the value of the name given', ->
          expect(objectType.get('foo').get()).to.equal 'bar'

      context 'when a property name is not given', ->
        it 'returns itself', ->
          expect(objectType.get().get('foo').get()).to.equal 'bar'

    describe '#set', ->
      it 'sets the value of the name given', ->
        objectType.set('foo', 'hello world')
        expect(objectType.get('foo').get()).to.equal 'hello world'

      it 'sets a value that has not been defined yet', ->
        objectType.set('bar', 'hello world')
        expect(objectType.get('bar').get()).to.equal 'hello world'

    describe '#keys', ->
      it 'gets the keys of all properties', ->
        expect(objectType.keys()).to.deep.equal ['foo', 'z']

    describe '#values', ->
      it 'gets the values of all properties', ->
        expect(objectType.values()).to.deep.equal ['bar', 1]
