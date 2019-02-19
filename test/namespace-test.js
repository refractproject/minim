const { expect } = require('./spec-helper');
const minim = require('../src/minim');
const Namespace = require('../src/namespace');
const JSONSerialiser = require('../src/serialisers/json');

describe('Minim namespace', () => {
  let namespace;
  let NullElement; let ObjectElement; let StringElement;

  beforeEach(() => {
    namespace = new Namespace();
    namespace.elementMap = {};
    namespace.elementDetection = [];
    namespace.useDefault();

    NullElement = namespace.getElementClass('null');
    ObjectElement = namespace.getElementClass('object');
    StringElement = namespace.getElementClass('string');
  });

  it('is exposed on the module', () => {
    expect(minim.Namespace).to.equal(Namespace);
  });

  it('gets returned from minim.namespace()', () => {
    expect(minim.namespace()).to.be.an.instanceof(Namespace);
  });

  describe('default elements', () => {
    it('are present by default', () => {
      expect(namespace.elementMap).not.to.be.empty;
    });

    it('can be created empty', () => {
      expect((new Namespace({ noDefault: true })).elementMap).to.deep.equal({});
    });

    it('can be added after instantiation', () => {
      const testnamespace = new Namespace({ noDefault: true });
      testnamespace.useDefault();
      expect(testnamespace.elementMap).not.to.be.empty;
    });
  });

  describe('#use', () => {
    it('can load a plugin module using the namespace property', () => {
      const plugin = {
        namespace(options) {
          const { base } = options;

          // Register a new element
          base.register('null2', NullElement);
        },
      };

      namespace.use(plugin);

      expect(namespace.elementMap).to.have.property('null2', NullElement);
    });

    it('can load a plugin module using the load property', () => {
      const plugin = {
        load(options) {
          const { base } = options;

          // Register a new element
          base.register('null3', NullElement);
        },
      };

      namespace.use(plugin);

      expect(namespace.elementMap).to.have.property('null3', NullElement);
    });
  });

  describe('#register', () => {
    it('should add to the element map', () => {
      namespace.register('test', ObjectElement);
      expect(namespace.elementMap.test).to.equal(ObjectElement);
    });
  });

  describe('#unregister', () => {
    it('should remove from the element map', () => {
      namespace.unregister('test');
      expect(namespace.elementMap).to.not.have.key('test');
    });
  });

  describe('#detect', () => {
    const test = function () { return true; };

    it('should prepend by default', () => {
      namespace.elementDetection = [[test, NullElement]];
      namespace.detect(test, StringElement);
      expect(namespace.elementDetection[0][1]).to.equal(StringElement);
    });

    it('should be able to append', () => {
      namespace.elementDetection = [[test, NullElement]];
      namespace.detect(test, ObjectElement, false);
      expect(namespace.elementDetection[1][1]).to.equal(ObjectElement);
    });
  });

  describe('#getElementClass', () => {
    it('should return ElementClass for unknown elements', () => {
      expect(namespace.getElementClass('unknown')).to.equal(namespace.Element);
    });
  });

  describe('#elements', () => {
    it('should contain registered element classes', () => {
      const { elements } = namespace;

      const elementValues = Object.keys(elements).map(name => elements[name]);
      elementValues.shift();

      const mapValues = Object.keys(namespace.elementMap).map(name => namespace.elementMap[name]);

      expect(elementValues).to.deep.equal(mapValues);
    });

    it('should use pascal casing', () => {
      Object.keys(namespace.elements).forEach((name) => {
        expect(name[0]).to.equal(name[0].toUpperCase());
      });
    });

    it('should contain the base element', () => {
      expect(namespace.elements.Element).to.equal(namespace.Element);
    });
  });

  describe('#toElement', () => {
    it('returns element when given element', () => {
      const element = new StringElement('hello');
      const toElement = namespace.toElement(element);

      expect(toElement).to.equal(element);
    });

    it('returns string element when given string', () => {
      const element = namespace.toElement('hello');

      expect(element).to.be.instanceof(StringElement);
      expect(element.toValue()).to.equal('hello');
    });
  });

  describe('serialisation', () => {
    it('provides a convenience serialiser', () => {
      expect(namespace.serialiser).to.be.instanceof(JSONSerialiser);
      expect(namespace.serialiser.namespace).to.equal(namespace);
    });

    it('provides a convenience fromRefract', () => {
      const element = namespace.fromRefract({
        element: 'string',
        content: 'hello',
      });

      expect(element).to.be.instanceof(StringElement);
      expect(element.toValue()).to.equal('hello');
    });

    it('provides a convenience toRefract', () => {
      const element = new StringElement('hello');
      const object = namespace.toRefract(element);

      expect(object).to.deep.equal({
        element: 'string',
        content: 'hello',
      });
    });
  });
});
