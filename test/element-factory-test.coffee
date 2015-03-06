{ expect, sinon } = require './spec-helper'

ElementFactory = require '../src/element-factory'

describe 'ElementFactory', ->
  factory = undefined

  beforeEach ->
    factory = ElementFactory.clear()

  describe '.build', ->
    context 'with a registered type', ->
      elementClass = undefined
      builtInstance = undefined

      beforeEach ->
        elementClass = sinon.stub()
        builtInstance = sinon.createStubInstance(elementClass)
        factory.register 'type', elementClass

      it 'constructs an instance of the type', ->
        expect(factory.build 'type').to.eql(builtInstance)

      it 'passes arguments to the constructor', ->
        args = sinon.mock('args')
        factory.build 'type', args
        expect(elementClass).to.have.been.calledWith(args)

    context 'without a registered type', ->
      it 'raises an error', ->
        expect(-> factory.build 'non-existent').to.throw(/^No element registered for type 'non-existent'.$/)

  describe '.register', ->
    context 'with type and elementClass arguments', ->
      it 'adds a class that can be built', ->
        elementClass = sinon.mock('element-class')
        elementClass.apply = sinon.stub()

        factory.register 'type', elementClass
        expect(-> factory.build 'type').to.not.throw(Error)

    context 'with incorrect arguments', ->
      type = sinon.mock('type')
      errorMsg = /^Both type and class arguments must exist.$/

      context 'with a null type argument', ->
        it 'raises an error', ->

          expect(-> factory.register null, type).to.throw(errorMsg)

      context 'with an undefined type argument', ->
        it 'raises an error', ->
          expect(-> factory.register undefined, type).to.throw(errorMsg)

      context 'with a null element class', ->
        it 'raises an error', ->
          expect(-> factory.register 'type', null).to.throw(errorMsg)

      context 'with an undefined element class', ->
        it 'raises an error', ->
          expect(-> factory.register 'type', undefined).to.throw(errorMsg)

    context 'with a previously registered type', ->
      beforeEach ->
        type = sinon.mock('type')
        factory.register 'type', type

      it 'raises an error', ->
        otherType = sinon.mock('other-type')
        expect(-> factory.register 'type', otherType).to.throw(/^Type 'type' already registered./)
