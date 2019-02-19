const { expect } = require('../spec-helper');
const minim = require('../../src/minim').namespace();
const KeyValuePair = require('../../src/key-value-pair');
const { RefElement } = require('../../src/minim');
const { ArraySlice } = require('../../src/minim');
const { ObjectSlice } = require('../../src/minim');
const { NumberElement } = require('../../src/minim');

describe('Element', () => {
  context('when initializing', () => {
    it('should initialize the correct meta data', () => {
      const element = new minim.Element({}, {
        id: 'foobar',
        classes: ['a', 'b'],
        title: 'Title',
        description: 'Description',
      });

      expect(element.meta.get('id').toValue()).to.equal('foobar');
      expect(element.meta.get('classes').toValue()).to.deep.equal(['a', 'b']);
      expect(element.meta.get('title').toValue()).to.equal('Title');
      expect(element.meta.get('description').toValue()).to.equal('Description');
    });

    it('should allow initialising with meta object', () => {
      const meta = new minim.elements.Object();
      meta.set('id', 'foobar');
      const element = new minim.Element(null, meta);

      expect(element.meta.get('id').toValue()).to.equal('foobar');
    });

    it('should allow initialising with attributes object', () => {
      const attributes = new minim.elements.Object();
      attributes.set('test', 'foobar');
      const element = new minim.Element(null, null, attributes);

      expect(element.attributes.get('test').toValue()).to.equal('foobar');
    });
  });

  describe('when initializing with value', () => {
    let el;

    it('should properly default to undefined', () => {
      el = new minim.Element();
      expect(el.toValue()).to.equal(undefined);
    });

    it('should properly serialize falsey string', () => {
      el = new minim.Element('');
      expect(el.toValue()).to.equal('');
    });

    it('should properly serialize falsey number', () => {
      el = new minim.Element(0);
      expect(el.toValue()).to.equal(0);
    });

    it('should properly serialize falsey boolean', () => {
      el = new minim.Element(false);
      expect(el.toValue()).to.equal(false);
    });

    it('should not be frozen', () => {
      el = new minim.Element('');
      expect(el.isFrozen).to.be.false;
    });
  });

  describe('#meta', () => {
    let element;

    before(() => {
      element = new minim.Element();
      element.meta.set('title', 'test');
    });

    it('retains the correct values', () => {
      expect(element.meta.getValue('title')).to.equal('test');
    });

    it('allows setting new attributes', () => {
      element.meta = { title: 'test2' };
      expect(element.meta.getValue('title')).to.equal('test2');
    });
  });

  describe('#attributes', () => {
    let element;

    before(() => {
      element = new minim.Element();
      element.attributes.set('foo', 'bar');
    });

    it('retains the correct values', () => {
      expect(element.attributes.getValue('foo')).to.equal('bar');
    });

    it('allows setting new attributes', () => {
      element.attributes = { test: 'bar' };
      expect(element.attributes.getValue('test')).to.equal('bar');
    });
  });

  describe('#content', () => {
    let element;

    before(() => {
      element = new minim.Element();
    });

    it('should allow setting undefined', () => {
      element.content = undefined;

      expect(element.content).to.equal(undefined);
    });

    it('should allow setting null', () => {
      element.content = null;

      expect(element.content).to.equal(null);
    });

    it('should allow setting boolean value', () => {
      element.content = true;

      expect(element.content).to.equal(true);
    });

    it('should allow setting string value', () => {
      element.content = '';

      expect(element.content).to.equal('');
    });

    it('should allow setting number value', () => {
      element.content = 5;

      expect(element.content).to.equal(5);
    });

    it('should allow setting element value', () => {
      element.content = new minim.Element();

      expect(element.content).to.deep.equal(new minim.Element());
    });

    it('should allow setting array of elements', () => {
      element.content = [new minim.Element(1)];

      expect(element.content).to.deep.equal([
        new minim.Element(1),
      ]);
    });

    it('should allow setting array of non-elements', () => {
      element.content = [true];

      expect(element.content).to.deep.equal([
        new minim.elements.Boolean(true),
      ]);
    });

    it('should allow setting object', () => {
      element.content = {
        name: 'Doe',
      };

      expect(element.content).to.deep.equal([
        new minim.elements.Member('name', 'Doe'),
      ]);
    });

    it('should allow setting KeyValuePair', () => {
      element.content = new KeyValuePair();

      expect(element.content).to.deep.equal(new KeyValuePair());
    });

    it('should allow setting ArraySlice (converted to array)', () => {
      element.content = new ArraySlice([1, 2]);

      expect(element.content).to.deep.equal([
        new NumberElement(1),
        new NumberElement(2),
      ]);
    });

    it('should allow setting ObjectSlice (converted to array)', () => {
      const MemberElement = minim.getElementClass('member');
      element.content = new ObjectSlice([new MemberElement('name', 'Doe')]);

      expect(element.content).to.deep.equal([
        new MemberElement('name', 'Doe'),
      ]);
    });
  });

  describe('#element', () => {
    context('when getting an element that has not been set', () => {
      let el;

      before(() => {
        el = new minim.Element();
      });

      it('returns base element', () => {
        expect(el.element).to.equal('element');
      });
    });

    context('when setting the element', () => {
      let el;

      before(() => {
        el = new minim.Element();
        el.element = 'foobar';
      });

      it('sets the element correctly', () => {
        expect(el.element).to.equal('foobar');
      });
    });
  });

  describe('#primitive', () => {
    it('returns undefined primitive', () => {
      const element = new minim.Element();
      expect(element.primitive()).to.be.undefined;
    });
  });

  describe('#equals', () => {
    let el;

    before(() => {
      el = new minim.elements.Object({
        foo: 'bar',
      }, {
        id: 'foobar',
      });
    });

    it('returns true when they are equal', () => {
      expect(el.meta.get('id').equals('foobar')).to.be.true;
    });

    it('returns false when they are not equal', () => {
      expect(el.meta.get('id').equals('not-equal')).to.be.false;
    });

    it('does a deep equality check', () => {
      expect(el.equals({ foo: 'bar' })).to.be.true;
      expect(el.equals({ foo: 'baz' })).to.be.false;
    });
  });

  describe('convenience methods', () => {
    const meta = {
      id: 'foobar',
      classes: ['a'],
      title: 'A Title',
      description: 'A Description',
    };

    context('when the meta is already set', () => {
      const el = new minim.Element(null, meta);

      Object.keys(meta).forEach((key) => {
        it(`provides a convenience method for ${key}`, () => {
          expect(el[key].toValue()).to.deep.equal(meta[key]);
        });
      });
    });

    context('when meta is set with getters and setters', () => {
      const el = new minim.Element(null);

      Object.keys(meta).forEach((key) => {
        el[key] = meta[key];

        it(`works for getters and setters for ${key}`, () => {
          expect(el[key].toValue()).to.deep.equal(meta[key]);
        });

        it(`stores the correct data in meta for ${key}`, () => {
          expect(el.meta.get(key).toValue()).to.deep.equal(meta[key]);
        });
      });
    });
  });

  describe('removing meta properties', () => {
    const el = minim.fromRefract({
      element: 'string',
      meta: {
        id: {
          element: 'string',
          content: 'foobar',
        },
        classes: {
          element: 'array',
          content: [
            {
              element: 'string',
              content: 'a',
            },
          ],
        },
        title: {
          element: 'string',
          content: 'A Title',
        },
        description: {
          element: 'string',
          content: 'A Description',
        },
      },
    });

    it('should allow removing property', () => {
      el.meta.remove('title');
      expect(el.meta.keys()).to.deep.equal(['id', 'classes', 'description']);
    });
  });

  describe('removing attribute properties', () => {
    const el = minim.fromRefract({
      element: 'string',
      attributes: {
        href: {
          element: 'string',
          content: 'foobar',
        },
        relation: {
          element: 'string',
          content: 'create',
        },
      },
    });

    it('should allow removing property', () => {
      el.attributes.remove('href');
      expect(el.attributes.keys()).to.deep.equal(['relation']);
    });
  });

  describe('hyperlinking', () => {
    context('when converting from Refract with links', () => {
      let el;

      before(() => {
        el = minim.fromRefract({
          element: 'string',
          meta: {
            links: {
              element: 'array',
              content: [
                {
                  element: 'link',
                  attributes: {
                    relation: {
                      element: 'string',
                      content: 'foo',
                    },
                    href: {
                      element: 'string',
                      content: '/bar',
                    },
                  },
                },
              ],
            },
          },
          content: 'foobar',
        });
      });

      it('correctly loads the links', () => {
        const link = el.meta.get('links').first;
        expect(link.element).to.equal('link');
        expect(link.relation.toValue()).to.equal('foo');
        expect(link.href.toValue()).to.equal('/bar');
      });
    });

    describe('#links', () => {
      context('when `links` is empty', () => {
        let el;

        before(() => {
          // String with no links
          el = minim.fromRefract({
            element: 'string',
            content: 'foobar',
          });
        });

        it('returns an empty array', () => {
          expect(el.links).to.have.length(0);
          expect(el.links.toValue()).to.deep.equal([]);
        });
      });

      context('when there are existing `links`', () => {
        let el;

        context('refract', () => {
          before(() => {
            el = minim.fromRefract({
              element: 'string',
              meta: {
                links: {
                  element: 'array',
                  content: [
                    {
                      element: 'link',
                      attributes: {
                        relation: {
                          element: 'string',
                          content: 'foo',
                        },
                        href: {
                          element: 'string',
                          content: '/bar',
                        },
                      },
                    },
                  ],
                },
              },
              content: 'foobar',
            });
          });

          it('provides the links from meta', () => {
            const link = el.links.first;
            expect(el.links).to.have.length(1);
            expect(link.relation.toValue()).to.equal('foo');
            expect(link.href.toValue()).to.equal('/bar');
          });
        });
      });
    });

    it('allows setting links', () => {
      const element = new minim.Element();
      element.links = new minim.elements.Array([
        new minim.elements.Link('el'),
      ]);

      expect(element.links).to.be.instanceof(minim.elements.Array);
      expect(element.links.length).to.equal(1);
    });
  });

  describe('#children', () => {
    it('returns empty element slice when content is primitive', () => {
      const element = new minim.Element('value');
      const { children } = element;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(0);
    });

    it('returns a direct child', () => {
      const child = new minim.Element('value');
      const element = new minim.Element(child);
      const { children } = element;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(1);
      expect(children.get(0)).to.equal(child);
    });

    it('returns element slice of direct children', () => {
      const child1 = new minim.Element('value1');
      const child2 = new minim.Element('value2');

      const element = new minim.Element([child1, child2]);
      const { children } = element;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(2);
      expect(children.get(0)).to.equal(child1);
      expect(children.get(1)).to.equal(child2);
    });

    it('returns element slice of key pair item', () => {
      const key = new minim.Element('key');
      const element = new minim.Element(new KeyValuePair(key));

      const { children } = element;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(1);
      expect(children.get(0)).to.equal(key);
    });

    it('returns element slice of key value pair items', () => {
      const key = new minim.Element('key');
      const value = new minim.Element('value');
      const element = new minim.Element(new KeyValuePair(key, value));

      const { children } = element;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(2);
      expect(children.get(0)).to.equal(key);
      expect(children.get(1)).to.equal(value);
    });
  });

  describe('#recursiveChildren', () => {
    it('returns empty element slice when content is primitive', () => {
      const element = new minim.Element('value');
      const children = element.recursiveChildren;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(0);
    });

    it('returns all direct recursive children', () => {
      const childchild = new minim.Element('value');
      const child = new minim.Element(childchild);
      const element = new minim.Element(child);
      const children = element.recursiveChildren;

      expect(children).to.be.instanceof(ArraySlice);
      expect(children.length).to.equal(2);
      expect(children.get(0)).to.equal(child);
      expect(children.get(1)).to.equal(childchild);
    });
  });

  context('when querying', () => {
    it('returns empty slice when there are no matching elements', () => {
      const element = new minim.Element();
      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.isEmpty).to.be.true;
    });

    it('finds direct element', () => {
      const StringElement = minim.getElementClass('string');
      const element = new minim.Element(
        new StringElement('Hello World')
      );

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['Hello World']);
    });

    it('finds direct element inside array', () => {
      const ArrayElement = minim.getElementClass('array');
      const StringElement = minim.getElementClass('string');
      const NumberElement = minim.getElementClass('number');
      const element = new ArrayElement([
        new StringElement('One'),
        new NumberElement(2),
        new StringElement('Three'),
      ]);

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['One', 'Three']);
    });

    it('finds direct element inside object', () => {
      const ObjectElement = minim.getElementClass('object');
      const MemberElement = minim.getElementClass('member');
      const StringElement = minim.getElementClass('string');
      const NumberElement = minim.getElementClass('number');

      const element = new ObjectElement();
      element.push(new MemberElement(new StringElement('key1'), new NumberElement(1)));
      element.push(new MemberElement(new NumberElement(2), new StringElement('value2')));

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['key1', 'value2']);
    });

    it('finds non-direct element inside element', () => {
      const StringElement = minim.getElementClass('string');

      const element = new minim.Element(
        new minim.Element(
          new StringElement('Hello World')
        )
      );

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['Hello World']);
    });

    it('finds non-direct element inside array', () => {
      const StringElement = minim.getElementClass('string');
      const ArrayElement = minim.getElementClass('array');

      const element = new minim.Element(
        new ArrayElement([
          new StringElement('Hello World'),
        ])
      );

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['Hello World']);
    });

    it('finds non-direct element inside object', () => {
      const ObjectElement = minim.getElementClass('object');
      const ArrayElement = minim.getElementClass('array');
      const MemberElement = minim.getElementClass('member');
      const StringElement = minim.getElementClass('string');
      const NumberElement = minim.getElementClass('number');

      const element = new ObjectElement();
      element.push(new MemberElement(
        new ArrayElement([new StringElement('key1')]),
        new NumberElement(1)
      ));
      element.push(new MemberElement(
        new NumberElement(2),
        new ArrayElement([new StringElement('value2')])
      ));

      const result = element.findRecursive('string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['key1', 'value2']);
    });

    it('finds elements contained in given elements', () => {
      const StringElement = minim.getElementClass('string');
      const ArrayElement = minim.getElementClass('array');
      const ObjectElement = minim.getElementClass('object');
      const MemberElement = minim.getElementClass('member');

      const object = new ObjectElement();
      object.push(new MemberElement(
        new StringElement('Three'),
        new ArrayElement([
          new StringElement('Four'),
        ])
      ));

      const element = new ArrayElement([
        new StringElement('One'),
        object,
      ]);

      element.freeze();

      const result = element.findRecursive('member', 'array', 'string');

      expect(result).to.be.instanceof(ArraySlice);
      expect(result.toValue()).to.deep.equal(['Four']);
    });
  });

  describe('#toValue', () => {
    it('returns raw value', () => {
      const element = new minim.Element(1);

      expect(element.toValue()).to.equal(1);
    });

    it('returns element value', () => {
      const element = new minim.Element(
        new minim.Element('Hello')
      );

      expect(element.toValue()).to.equal('Hello');
    });

    it('returns array of element value', () => {
      const element = new minim.Element([
        new minim.Element('Hello'),
      ]);

      expect(element.toValue()).to.deep.equal(['Hello']);
    });

    it('returns KeyValuePair value', () => {
      const element = new minim.Element(
        new KeyValuePair(
          new minim.Element('name'),
          new minim.Element('doe')
        )
      );

      expect(element.toValue()).to.deep.equal({
        key: 'name',
        value: 'doe',
      });
    });
  });

  describe('freezing an element', () => {
    it('is frozen after being frozen', () => {
      const element = new minim.Element('hello');
      element.freeze();

      expect(element.isFrozen).to.be.true;
    });

    it('freezes children when freezing', () => {
      const element = new minim.Element([new minim.elements.String('hello')]);
      element.freeze();

      expect(element.content[0].isFrozen).to.be.true;
    });

    it('sets the parent of any children', () => {
      const element = new minim.Element([new minim.elements.String('hello')]);
      element.freeze();

      expect(element.content[0].parent).to.equal(element);
    });

    it('sets the parent of meta elements', () => {
      const element = new minim.Element();
      element.title = 'Example';
      element.freeze();

      expect(element.meta.parent).to.equal(element);
      expect(element.meta.content[0].parent).to.equal(element.meta);
    });

    it("doesn't allow modification of content array once frozen", () => {
      const element = new minim.Element([new minim.elements.String('hello')]);
      element.freeze();

      expect(() => {
        element.content.push(new minim.elements.String('hello'));
      }).to.throw();
    });

    it("doesn't allow modification of meta once frozen", () => {
      const element = new minim.Element();
      element.freeze();

      expect(() => {
        element.id = 'Hello';
      }).to.throw();
    });

    it("doesn't allow modification of attributes once frozen", () => {
      const element = new minim.Element();
      element.freeze();

      expect(() => {
        element.attributes.set('key', 'value');
      }).to.throw();
    });

    context('returns frozen objects from lazy accessors', () => {
      // An elements meta and attributes are lazy loaded and created on access.
      // This would cause problems because that means you cannot access
      // meta/attributes on frozen elements because the accessor has
      // side-effects of creation.

      const element = new minim.Element();
      element.freeze();

      it('meta', () => {
        expect(element.meta.isFrozen).to.be.true;
      });

      it('attributes', () => {
        expect(element.attributes.isFrozen).to.be.true;
      });

      it('getMetaProperty', () => {
        expect(element.getMetaProperty('title', '').isFrozen).to.be.true;
      });
    });
  });

  describe('#parents', () => {
    it('configures parent when setting element content to be an element', () => {
      const one = new minim.Element('bottom');
      const two = new minim.Element(one);
      const three = new minim.Element(two);
      three.freeze();

      expect(one.parents).to.be.instanceof(ArraySlice);
      expect(one.parents.elements).to.deep.equal([two, three]);
    });
  });

  describe('#clone', () => {
    it('clones an element', () => {
      const element = new minim.Element('hello');
      const cloned = element.clone();

      expect(cloned.content).to.equal(element.content);
      expect(cloned).not.to.equal(element);
    });

    it('clones an element name', () => {
      const element = new minim.Element('hello');
      element.element = 'test';
      const cloned = element.clone();

      expect(cloned.element).to.equal('test');
    });

    it('clones an element with child element', () => {
      const child = new minim.Element('child');
      const element = new minim.Element(child);
      const cloned = element.clone();

      expect(cloned.content).not.to.equal(child);
      expect(cloned.content.content).to.equal('child');
    });

    it('clones an element with array of elements', () => {
      const child = new minim.Element('child');
      const element = new minim.Element([child]);
      const cloned = element.clone();

      expect(cloned.content[0]).not.to.equal(child);
      expect(cloned.content[0].content).to.equal('child');
    });

    it('clones an element with key value pair', () => {
      const child = new minim.Element('name');
      const element = new minim.elements.Member(child);
      const cloned = element.clone();

      expect(cloned.content.key).not.to.equal(child);
      expect(cloned.content.key.content).to.equal('name');
    });

    it('clones meta values', () => {
      const element = new minim.Element();
      element.title = 'Test';

      const cloned = element.clone();

      expect(cloned.title.toValue()).to.equal('Test');
    });

    it('clones attributes values', () => {
      const element = new minim.Element();
      element.attributes.set('name', 'Test');

      const cloned = element.clone();

      expect(cloned.attributes.get('name').toValue()).to.equal('Test');
    });
  });

  describe('#toRef', () => {
    it('can create ref element for an element', () => {
      const element = new minim.Element();
      element.id = 'example';

      const ref = element.toRef();

      expect(ref).to.be.instanceof(RefElement);
      expect(ref.path.toValue()).to.be.equal('element');
      expect(ref.content).to.equal('example');
    });

    it('can create a ref element with a path', () => {
      const element = new minim.Element();
      element.id = 'example';

      const ref = element.toRef('attributes');

      expect(ref).to.be.instanceof(RefElement);
      expect(ref.path.toValue()).to.be.equal('attributes');
      expect(ref.content).to.equal('example');
    });

    it('throws error when creating ref element from element without ID', () => {
      const element = new minim.Element();

      expect(() => { element.toRef(); }).to.throw();
    });
  });
});
