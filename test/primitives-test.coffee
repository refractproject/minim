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

    context 'when give keyValue', ->
      returnedType = undefined
      el = undefined

      # { foo: 'bar' }
      el =
        element: 'keyValue'
        attributes:
          key: 'foo'
        content:
          element: 'string'
          attributes: {}
          content: 'bar'

      before ->
        returnedType = minim.convertFromDom el

      it 'returns keyValue element', ->
        expect(returnedType.elementType()).to.equal 'keyValue'

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
          element: 'keyValue'
          attributes:
            key: 'foo'
          content:
            element: 'string'
            attributes: {}
            content: 'bar'
        ,
          element: 'keyValue'
          attributes:
            key: 'z'
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

  describe 'KeyValueType', ->
    keyValueType = undefined
    before ->
      keyValueType = new minim.KeyValueType('foo', 'bar')

    describe '.attributes', ->
      it 'has the correct key', ->
        keyValueType.attributes.key = 'foo'

    describe '#elementType', ->
      it 'is a keyValue type', ->
        expect(keyValueType.elementType()).to.equal 'keyValue'

    describe '#toValue', ->
      it 'returns the string type', ->
        expect(keyValueType.toValue()).to.equal 'bar'

    describe '#toDom', ->
      expected =
        element: 'keyValue'
        attributes:
          key: 'foo'

        content:
          element: 'string'
          attributes: {}
          content: 'bar'

      it 'returns a keyValue type DOM object', ->
        expect(keyValueType.toDom()).to.deep.equal expected

    describe '#toCompactDom', ->
      expected = ['keyValue', {key: 'foo'}, ['string', {}, 'bar']]

      it 'returns a KeyValue Compact DOM object', ->
        expect(keyValueType.toCompactDom()).to.deep.equal expected

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
          element: 'keyValue'
          attributes:
            key: 'foo'
          content:
            element: 'string'
            attributes: {}
            content: 'bar'
        ,
          element: 'keyValue'
          attributes:
            key: 'z'
          content:
            element: 'number'
            attributes: {}
            content: 1
         ]

      it 'returns an object DOM object', ->
        expect(objectType.toDom()).to.deep.equal expected

    describe '#toCompactDom', ->
      expected = ['object', {}, [['keyValue', {key: 'foo'}, ['string', {}, 'bar']],
                                 ['keyValue', {key: 'z'}, ['number', {}, 1 ]]]]

      it 'returns a object Compact DOM object', ->
        expect(objectType.toCompactDom()).to.deep.equal expected
