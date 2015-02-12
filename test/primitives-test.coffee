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

    describe '#toDom', ->
      expected =
        element: 'null'
        attributes: {}
        content: null

      it 'returns a null DOM object', ->
        expect(nullType.toDom()).to.deep.equal expected

    describe '#toCompactDom', ->
      expected = ['null', {}, null]

      it 'returns a null Compact DOM object', ->
        expect(nullType.toCompactDom()).to.deep.equal expected

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

    describe '#toDom', ->
      expected =
        element: 'string'
        attributes: {}
        content: 'foobar'

      it 'returns a string DOM object', ->
        expect(stringType.toDom()).to.deep.equal expected

    describe '#toCompactDom', ->
      expected = ['string', {}, 'foobar']
      it 'returns a string Compact DOM object', ->
        expect(stringType.toCompactDom()).to.deep.equal expected

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

    describe '#toDom', ->
      expected =
        element: 'number'
        attributes: {}
        content: 4

      it 'returns a number DOM object', ->
        expect(numberType.toDom()).to.deep.equal expected

    describe '#toCompactDom', ->
      expected = ['number', {}, 4]

      it 'returns a number Compact DOM object', ->
        expect(numberType.toCompactDom()).to.deep.equal expected

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

    describe '#toDom', ->
      expected =
        element: 'boolean'
        attributes: {}
        content: true

      it 'returns a boolean DOM object', ->
        expect(boolType.toDom()).to.deep.equal expected

    describe '#toCompactDom', ->
      expected = ['boolean', {}, true]

      it 'returns a boolean Compact DOM object', ->
        expect(boolType.toCompactDom()).to.deep.equal expected

    describe '#get', ->
      it 'returns the boolean value', ->
        expect(boolType.get()).to.equal true

    describe '#set', ->
      it 'sets the value of the boolean', ->
        boolType.set(false)
        expect(boolType.get()).to.equal false

  describe 'ArrayType', ->
    arrayType = undefined
    before ->
      arrayType = new minim.ArrayType(['a', true, null, 1 ])

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

    describe '#toDom', ->
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
        expect(arrayType.toDom()).to.deep.equal expected

    describe '#toCompactDom', ->
      expected = ['array', {}, [['string', {}, 'a'],
                                ['boolean', {}, true],
                                ['null', {}, null],
                                ['number', {}, 1]]]
      it 'returns an array Compact DOM object', ->
        expect(arrayType.toCompactDom()).to.deep.equal expected

    describe '#get', ->
      it 'returns the item from the array', ->
        expect(arrayType.get(0).get()).to.equal 'a'

    describe '#set', ->
      it 'sets the value of the array', ->
        arrayType.set(0, 'hello world')
        expect(arrayType.get(0).get()).to.equal 'hello world'

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

    describe '#toDom', ->
      expected =
        element: 'property'
        attributes:
          name: 'foo'

        content:
          element: 'string'
          attributes: {}
          content: 'bar'

      it 'returns a property type DOM object', ->
        expect(propertyType.toDom()).to.deep.equal expected

    describe '#toCompactDom', ->
      expected = ['property', {name: 'foo'}, ['string', {}, 'bar']]

      it 'returns a PropertyType Compact DOM object', ->
        expect(propertyType.toCompactDom()).to.deep.equal expected

    describe '#get', ->
      it 'returns the value and name', ->
        expect(propertyType.get()).to.equal 'bar'

    describe '#set', ->
      it 'sets the value of the property', ->
        propertyType.set('hello world')
        expect(propertyType.get()).to.equal 'hello world'

  describe 'ObjectType', ->
    objectType = undefined

    before ->
      objectType = new minim.ObjectType
        foo: 'bar'
        z: 1

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

    describe '#toDom', ->
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
        expect(objectType.toDom()).to.deep.equal expected

    describe '#toCompactDom', ->
      expected = ['object', {}, [['property', {name: 'foo'}, ['string', {}, 'bar']],
                                 ['property', {name: 'z'}, ['number', {}, 1 ]]]]

      it 'returns a object Compact DOM object', ->
        expect(objectType.toCompactDom()).to.deep.equal expected

    describe '#get', ->
      it 'returns the value of the name given', ->
        expect(objectType.get('foo').get()).to.equal 'bar'

    describe '#set', ->
      it 'sets the value of the name given', ->
        objectType.set('foo', 'hello world')
        expect(objectType.get('foo').get()).to.equal 'hello world'
