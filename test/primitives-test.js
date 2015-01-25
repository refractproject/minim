var mocha = require('mocha'),
    chai = require('chai'),
    expect = chai.expect,
    minim = require('../lib/primitives');

describe('Minim Primitives', function() {
  describe('convertToType', function() {
    var typeCheck = function(name, val) {
      var returnedType;

      context('when given '+name, function() {
        before(function() {
          returnedType = minim.convertToType(val);
        });

        it('returns '+name, function() {
          expect(returnedType.elementType()).to.equal(name);
        });
      });
    };

    typeCheck('null', null);
    typeCheck('string', 'foobar');
    typeCheck('number', 1);
    typeCheck('boolean', true);
    typeCheck('array', [1, 2, 3]);
    typeCheck('object', { foo: 'bar' });
  });

  describe('convertFromType', function() {
    var typeCheck = function(name, el) {
      context('when given '+name, function() {
        var returnedType;

        before(function() {
          returnedType = minim.convertFromDom(el);
        });

        it('returns '+name+' element', function() {
          expect(returnedType.elementType()).to.equal(name);
        });

        it('has the correct value', function() {
          expect(returnedType.toValue()).to.equal(el.content);
        });
      });
    };

    typeCheck('null', {
      element: 'null',
      meta: {},
      content: null
    });

    typeCheck('string', {
      element: 'string',
      meta: {},
      content: 'foo'
    });

    typeCheck('number', {
      element: 'number',
      meta: {},
      content: 4
    });

    typeCheck('boolean', {
      element: 'boolean',
      meta: {},
      content: true
    });

    context('when give keyValue', function() {
      var returnedType, el;

      // { foo: 'bar' }
      el = {
        element: 'keyValue',
        meta: { key: 'foo' },
        content: {
          element: 'string',
          meta: {},
          content: 'bar'
        }
      };

      before(function() {
        returnedType = minim.convertFromDom(el);
      });

      it('returns keyValue element', function() {
        expect(returnedType.elementType()).to.equal('keyValue');
      });

      it('has the correct value', function() {
        expect(returnedType.toValue()).to.equal(el.content.content);
      });

      it('has the right meta', function() {
        expect(returnedType.meta).to.deep.equal(el.meta);
      });
    });

    context('when give array', function() {
      var returnedType, el;

      // [1, 2]
      el = {
        element: 'array',
        meta: {},
        content: [
          {
            element: 'number',
            meta: {},
            content: 1
          },
          {
            element: 'number',
            meta: {},
            content: 2
          }
        ]
      };

      before(function() {
        returnedType = minim.convertFromDom(el);
      });

      it('returns array element', function() {
        expect(returnedType.elementType()).to.equal('array');
      });

      it('has the correct values', function() {
        expect(returnedType.toValue()).to.deep.equal([1, 2]);
      });
    });

    context('when give array', function() {
      var returnedType, el;

      // { foo: 'bar', z: 2 }
      el = {
        element: 'object',
        meta: {},
        content: [
          {
            element: 'keyValue',
            meta: { key: 'foo' },
            content: {
              element: 'string',
              meta: {},
              content: 'bar'
            }
          },
          {
            element: 'keyValue',
            meta: { key: 'z' },
            content: {
              element: 'number',
              meta: {},
              content: 2
            }
          }
        ]
      };

      before(function() {
        returnedType = minim.convertFromDom(el);
      });

      it('returns array element', function() {
        expect(returnedType.elementType()).to.equal('object');
      });

      it('has the correct values', function() {
        expect(returnedType.toValue()).to.deep.equal({ foo: 'bar', z: 2 });
      });
    });
  });

  describe('NullType', function() {
    var nullType;

    before(function() {
      nullType = new minim.NullType();
    });

    describe('#elementType', function() {
      it('is null', function() {
        expect(nullType.elementType()).to.equal('null');
      });
    });

    describe('#toValue', function() {
      it('returns null', function() {
        expect(nullType.toValue()).to.equal(null);
      });
    });

    describe('#toDom', function() {
      var expected = {
        element: 'null',
        meta: {},
        content: null
      };

      it('returns a null DOM object', function() {
        expect(nullType.toDom()).to.deep.equal(expected);
      });
    });
  });

  describe('StringType', function() {
    var stringType;

    before(function() {
      stringType = new minim.StringType('foobar');
    });

    describe('#elementType', function() {
      it('is a boolean', function() {
        expect(stringType.elementType()).to.equal('string');
      });
    });

    describe('#toValue', function() {
      it('returns the string', function() {
        expect(stringType.toValue()).to.equal('foobar');
      });
    });

    describe('#toDom', function() {
      var expected = {
        element: 'string',
        meta: {},
        content: 'foobar'
      };

      it('returns a string DOM object', function() {
        expect(stringType.toDom()).to.deep.equal(expected);
      });
    });
  });

  describe('NumberType', function() {
    var numberType;

    before(function() {
      numberType = new minim.NumberType(4);
    });

    describe('#elementType', function() {
      it('is a boolean', function() {
        expect(numberType.elementType()).to.equal('number');
      });
    });

    describe('#toValue', function() {
      it('returns the number', function() {
        expect(numberType.toValue()).to.equal(4);
      });
    });

    describe('#toDom', function() {
      var expected = {
        element: 'number',
        meta: {},
        content: 4
      };

      it('returns a number DOM object', function() {
        expect(numberType.toDom()).to.deep.equal(expected);
      });
    });
  });

  describe('BoolType', function() {
    var boolType;

    before(function() {
      boolType = new minim.BoolType(true);
    });

    describe('#elementType', function() {
      it('is a boolean', function() {
        expect(boolType.elementType()).to.equal('boolean');
      });
    });

    describe('#toValue', function() {
      it('returns the boolean', function() {
        expect(boolType.toValue()).to.equal(true);
      });
    });

    describe('#toDom', function() {
      var expected = {
        element: 'boolean',
        meta: {},
        content: true
      };

      it('returns a boolean DOM object', function() {
        expect(boolType.toDom()).to.deep.equal(expected);
      });
    });
  });

  describe('ArrayType', function() {
    var arrayType;

    before(function() {
      arrayType = new minim.ArrayType(["a", true, null, 1]);
    });

    describe('.content', function() {
      var correctType, storedTypes;

      before(function() {
        correctTypes = ['string', 'boolean', 'null', 'number'];
        storedTypes = arrayType.content.map(function(el) {
          return el.elementType();
        });
      });

      it('stores the correct types', function() {
        expect(storedTypes).to.deep.equal(correctTypes);
      });
    });

    describe('#elementType', function() {
      it('is an array', function() {
        expect(arrayType.elementType()).to.equal('array');
      });
    });

    describe('#toValue', function() {
      it('returns the array', function() {
        expect(arrayType.toValue()).to.deep.equal(['a', true, null, 1]);
      });
    });

    describe('#toDom', function() {
      var expected = {
        element: 'array',
        meta: {},
        content: [
          {
            element: 'string',
            meta: {},
            content: 'a'
          },
          {
            element: 'boolean',
            meta: {},
            content: true
          },
          {
            element: 'null',
            meta: {},
            content: null
          },
          {
            element: 'number',
            meta: {},
            content: 1
          }
        ]
      };

      it('returns an array DOM object', function() {
        expect(arrayType.toDom()).to.deep.equal(expected);
      });
    });
  });

  describe('KeyValueType', function() {
    var keyValueType;

    before(function() {
      keyValueType = new minim.KeyValueType('foo', 'bar');
    });

    describe('.meta', function() {
      it('has the correct key', function() {
        keyValueType.meta.key = 'foo';
      });
    });

    describe('#elementType', function() {
      it('is a keyValue type', function() {
        expect(keyValueType.elementType()).to.equal('keyValue');
      });
    });

    describe('#toValue', function() {
      it('returns the string type', function() {
        expect(keyValueType.toValue()).to.equal('bar');
      });
    });

    describe('#toDom', function() {
      var expected = {
        element: 'keyValue',
        meta: { key: 'foo' },
        content: {
          element: 'string',
          meta: {},
          content: 'bar'
        }
      };

      it('returns a keyValue type DOM object', function() {
        expect(keyValueType.toDom()).to.deep.equal(expected);
      });
    });
  });

  describe('ObjectType', function() {
    var objectType;

    before(function() {
      objectType = new minim.ObjectType({ foo: 'bar', z: 1});
    });

    describe('.content', function() {
      var correctType, storedTypes;

      before(function() {
        correctTypes = ['string', 'number'];
        storedTypes = objectType.content.map(function(el) {
          return el.content.elementType();
        });
      });

      it('has the correct types', function() {
        expect(storedTypes).to.deep.equal(correctTypes);
      });
    });

    describe('#elementType', function() {
      it('is a string type', function() {
        expect(objectType.elementType()).to.equal('object');
      });
    });

    describe('#toValue', function() {
      it('returns the object', function() {
        expect(objectType.toValue()).to.deep.equal({ foo: 'bar', z: 1});
      });
    });

    describe('#toDom', function() {
      var expected = {
        element: 'object',
        meta: {},
        content: [
          {
            element: 'keyValue',
            meta: { key: 'foo' },
            content: {
              element: 'string',
              meta: {},
              content: 'bar'
            }
          },
          {
            element: 'keyValue',
            meta: { key: 'z' },
            content: {
              element: 'number',
              meta: {},
              content: 1
            }
          }
        ]
      };

      it('returns an object DOM object', function() {
        expect(objectType.toDom()).to.deep.equal(expected);
      });
    });
  });
});
