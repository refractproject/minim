const { expect } = require('../spec-helper');
const minim = require('../../src/minim').namespace();

const ObjectElement = minim.getElementClass('object');
const StringElement = minim.getElementClass('string');

describe('ObjectElement', () => {
  let objectElement;

  function setObject() {
    objectElement = new ObjectElement({
      foo: 'bar',
      z: 1,
    });
  }

  before(() => {
    setObject();
  });

  beforeEach(() => {
    setObject();
  });

  describe('.content', () => {
    let correctElementNames;
    let storedElementNames;

    before(() => {
      correctElementNames = ['string', 'number'];
      storedElementNames = objectElement.content.map(el => el.value.element);
    });

    it('has the correct element names', () => {
      expect(storedElementNames).to.deep.equal(correctElementNames);
    });
  });

  describe('#element', () => {
    it('is a string element', () => {
      expect(objectElement.element).to.equal('object');
    });
  });

  describe('#primitive', () => {
    it('returns object as the Refract primitive', () => {
      expect(objectElement.primitive()).to.equal('object');
    });
  });

  describe('#toValue', () => {
    it('returns the object', () => {
      expect(objectElement.toValue()).to.deep.equal({
        foo: 'bar',
        z: 1,
      });
    });
  });

  describe('#get', () => {
    context('when a property name is given', () => {
      it('returns the value of the name given', () => {
        expect(objectElement.get('foo').toValue()).to.equal('bar');
      });
    });

    context('when a property name is not given', () => {
      it('is undefined', () => {
        expect(objectElement.get()).to.be.undefined;
      });
    });
  });

  describe('#getValue', () => {
    context('when a property name is given', () => {
      it('returns the value of the name given', () => {
        expect(objectElement.getValue('foo')).to.equal('bar');
      });
    });

    context('when a property name is not given', () => {
      it('is undefined', () => {
        expect(objectElement.getValue()).to.be.undefined;
      });
    });
  });

  describe('#getMember', () => {
    context('when a property name is given', () => {
      it('returns the correct member object', () => {
        expect(objectElement.getMember('foo').value.toValue()).to.equal('bar');
      });
    });

    context('when a property name is not given', () => {
      it('is undefined', () => {
        expect(objectElement.getMember()).to.be.undefined;
      });
    });
  });

  describe('#getKey', () => {
    context('when a property name is given', () => {
      it('returns the correct key object', () => {
        expect(objectElement.getKey('foo').toValue()).to.equal('foo');
      });
    });

    context('when a property name given that does not exist', () => {
      it('returns undefined', () => {
        expect(objectElement.getKey('not-defined')).to.be.undefined;
      });
    });

    context('when a property name is not given', () => {
      it('returns undefined', () => {
        expect(objectElement.getKey()).to.be.undefined;
      });
    });
  });

  describe('#set', () => {
    it('sets the value of the name given', () => {
      expect(objectElement.get('foo').toValue()).to.equal('bar');
      objectElement.set('foo', 'hello world');
      expect(objectElement.get('foo').toValue()).to.equal('hello world');
    });

    it('sets a value that has not been defined yet', () => {
      objectElement.set('bar', 'hello world');
      expect(objectElement.get('bar').toValue()).to.equal('hello world');
    });

    it('accepts an object', () => {
      const obj = new ObjectElement();
      obj.set({ foo: 'bar' });
      expect(obj.get('foo').toValue()).to.equal('bar');
    });

    it('should refract key and value from object', () => {
      const obj = new ObjectElement();
      obj.set('key', 'value');
      const member = obj.getMember('key');

      expect(member.key).to.be.instanceof(StringElement);
      expect(member.value).to.be.instanceof(StringElement);
    });
  });

  describe('#keys', () => {
    it('gets the keys of all properties', () => {
      expect(objectElement.keys()).to.deep.equal(['foo', 'z']);
    });
  });

  describe('#remove', () => {
    it('removes the given key', () => {
      const removed = objectElement.remove('z');

      expect(removed.toValue()).to.deep.equal({ key: 'z', value: 1 });
      expect(objectElement.keys()).to.deep.equal(['foo']);
    });
  });

  describe('#remove non-existing item', () => {
    it('should not change the object element', () => {
      const removed = objectElement.remove('k');

      expect(removed).to.deep.equal(null);
      expect(objectElement.keys()).to.deep.equal(['foo', 'z']);
    });
  });

  describe('#values', () => {
    it('gets the values of all properties', () => {
      expect(objectElement.values()).to.deep.equal(['bar', 1]);
    });
  });

  describe('#hasKey', () => {
    it('checks to see if a key exists', () => {
      expect(objectElement.hasKey('foo')).to.be.true;
      expect(objectElement.hasKey('does-not-exist')).to.be.false;
    });
  });

  describe('#items', () => {
    it('provides a list of name/value pairs to iterate', () => {
      const keys = [];
      const values = [];

      objectElement.items().forEach((item) => {
        const key = item[0];
        const value = item[1];

        keys.push(key);
        values.push(value);
      });

      expect(keys).to.have.members(['foo', 'z']);
      expect(values).to.have.length(2);
    });
  });

  function itHascollectionMethod(method) {
    describe(`#${method}`, () => {
      it(`responds to #${method}`, () => {
        expect(objectElement).to.respondTo(method);
      });
    });
  }

  itHascollectionMethod('map');
  itHascollectionMethod('filter');
  itHascollectionMethod('forEach');
  itHascollectionMethod('push');
  itHascollectionMethod('add');

  describe('#map', () => {
    it('provides the keys', () => {
      const keys = objectElement.map((value, key) => key.toValue());
      expect(keys).to.deep.equal(['foo', 'z']);
    });

    it('provides the values', () => {
      const values = objectElement.map(value => value.toValue());
      expect(values).to.deep.equal(['bar', 1]);
    });

    it('provides the members', () => {
      const keys = objectElement.map((value, key, member) => member.key.toValue());
      expect(keys).to.deep.equal(['foo', 'z']);
    });
  });

  describe('#compactMap', () => {
    it('provides the keys', () => {
      const keys = objectElement.compactMap((value, key) => {
        if (key.toValue() === 'foo') {
          return key.toValue();
        }

        return undefined;
      });
      expect(keys).to.deep.equal(['foo']);
    });

    it('provides the values', () => {
      const values = objectElement.compactMap((value, key) => {
        if (key.toValue() === 'foo') {
          return value.toValue();
        }

        return undefined;
      });
      expect(values).to.deep.equal(['bar']);
    });

    it('provides the members', () => {
      const keys = objectElement.compactMap((value, key, member) => {
        if (key.toValue() === 'foo') {
          return member.key.toValue();
        }

        return undefined;
      });
      expect(keys).to.deep.equal(['foo']);
    });
  });

  describe('#filter', () => {
    it('allows for filtering on keys', () => {
      const foo = objectElement.filter((value, key) => key.equals('foo'));
      expect(foo.keys()).to.deep.equal(['foo']);
    });

    it('allows for filtering on values', () => {
      const foo = objectElement.filter(value => value.equals('bar'));
      expect(foo.keys()).to.deep.equal(['foo']);
    });

    it('allows for filtering on members', () => {
      const foo = objectElement.filter((value, key, member) => member.value.equals('bar'));
      expect(foo.keys()).to.deep.equal(['foo']);
    });
  });

  describe('#reject', () => {
    it('allows for rejecting on keys', () => {
      const foo = objectElement.reject((value, key) => key.equals('foo'));
      expect(foo.keys()).to.deep.equal(['z']);
    });

    it('allows for rejecting on values', () => {
      const foo = objectElement.reject(value => value.equals('bar'));
      expect(foo.keys()).to.deep.equal(['z']);
    });

    it('allows for rejecting on members', () => {
      const foo = objectElement.reject((value, key, member) => member.value.equals('bar'));
      expect(foo.keys()).to.deep.equal(['z']);
    });
  });

  describe('#reduce', () => {
    const numbers = new ObjectElement({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });

    it('allows for reducing on keys', () => {
      const letters = numbers.reduce((result, item, key) => result.push(key), []);
      expect(letters.toValue()).to.deep.equal(['a', 'b', 'c', 'd']);
    });

    it('sends member and object elements', () => {
      numbers.reduce((result, item, key, member, obj) => {
        expect(obj.content).to.contain(member);
        expect(obj).to.equal(numbers);
      });
    });

    context('when no beginning value is given', () => {
      it('correctly reduces the object', () => {
        const total = numbers.reduce((result, item) => result.toValue() + item.toValue());
        expect(total.toValue()).to.equal(10);
      });
    });

    context('when a beginning value is given', () => {
      it('correctly reduces the object', () => {
        const total = numbers.reduce((result, item) => result.toValue() + item.toValue(), 20);
        expect(total.toValue()).to.equal(30);
      });
    });
  });

  describe('#forEach', () => {
    it('provides the keys', () => {
      const keys = [];
      objectElement.forEach((value, key) => keys.push(key.toValue()));
      expect(keys).to.deep.equal(['foo', 'z']);
    });

    it('provides the values', () => {
      const values = [];
      objectElement.forEach(value => values.push(value.toValue()));
      expect(values).to.deep.equal(['bar', 1]);
    });

    it('provides the members', () => {
      const keys = [];
      objectElement.forEach((value, key, member) => keys.push(member.key.toValue()));
      expect(keys).to.deep.equal(['foo', 'z']);
    });
  });

  describe('#find', () => {
    it('allows for searching based on the keys', () => {
      const search = objectElement.find((value, key) => key.toValue() === 'z');
      expect(search.toValue()).to.deep.equal([1]);
    });

    it('allows for searching based on the member', () => {
      const search = objectElement.find((value, key, member) => member.key.toValue() === 'z');
      expect(search.toValue()).to.deep.equal([1]);
    });
  });

  // describe('#[Symbol.iterator]', function() {
  //   it('can be used in a for ... of loop', function() {
  //     var items = [];
  //     for (let item of objectElement) {
  //       items.push(item);
  //     }
  //
  //     expect(items).to.have.length(2);
  //   });
  // });
});
