var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

describe('BaseElement', function() {
  context('when initializing', function() {
    var el;

    before(function() {
      el = new minim.BaseElement({}, {
        id: 'foobar',
        classes: ['a', 'b'],
        title: 'Title',
        description: 'Description'
      });
    });

    it('should initialize the correct meta data', function() {
      expect(el.meta.get('id').toValue()).to.equal('foobar');
      expect(el.meta.get('classes').toValue()).to.deep.equal(['a', 'b']);
      expect(el.meta.get('title').toValue()).to.equal('Title');
      expect(el.meta.get('description').toValue()).to.equal('Description');
    });
  });

  describe('when initializing with value', function() {
    var el;

    it('should properly serialize falsey string', function() {
      el = new minim.BaseElement('');
      expect(el.toValue()).to.equal('');
    });

    it('should properly serialize falsey number', function() {
      el = new minim.BaseElement(0);
      expect(el.toValue()).to.equal(0);
    });

    it('should properly serialize falsey boolean', function() {
      el = new minim.BaseElement(false);
      expect(el.toValue()).to.equal(false);
    });
  });

  describe('#attributes', function() {
    var element;

    var refract = {
      element: 'element',
      meta: {},
      attributes: {
        foo: 'bar'
      },
      content: null
    }

    before(function() {
      element = new minim.BaseElement();
      element.attributes.set('foo', 'bar');
    });

    it('retains the correct values', function() {
      expect(element.toRefract()).to.deep.equal(refract);
    });
  });

  describe('#element', function() {
    context('when getting an element that has not been set', function() {
      var el;

      before(function() {
        el = new minim.BaseElement();
      });

      it('returns base element', function() {
        expect(el.element).to.equal('element');
      });
    });

    context('when setting the element', function() {
      var el;

      before(function() {
        el = new minim.BaseElement();
        el.element = 'foobar';
      });

      it('sets the element correctly', function() {
        expect(el.element).to.equal('foobar');
      });
    })
  });

  describe('#equals', function() {
    var el;

    before(function() {
      el = new minim.BaseElement({
        foo: 'bar'
      }, {
        id: 'foobar'
      });
    });

    it('returns true when they are equal', function() {
      expect(el.meta.get('id').equals('foobar')).to.be.true;
    });

    it('returns false when they are not equal', function() {
      expect(el.meta.get('id').equals('not-equal')).to.be.false;
    });

    it('does a deep equality check', function() {
      expect(el.equals({ foo: 'bar'})).to.be.true;
      expect(el.equals({ foo: 'baz'})).to.be.false;
    });
  });

  describe('convenience methods', function() {
    var meta = {
      id: 'foobar',
      classes: ['a'],
      title: 'A Title',
      description: 'A Description'
    };

    context('when the meta is already set', function() {
      var el = new minim.BaseElement(null, _.clone(meta));

      _.forEach(_.keys(meta), function(key) {
        it('provides a convenience method for ' + key, function() {
          expect(el[key].toValue()).to.deep.equal(meta[key]);
        });
      });
    });

    context('when meta is set with getters and setters', function() {
      var el = new minim.BaseElement(null);

      _.forEach(_.keys(meta), function(key) {
        el[key] = meta[key];

        it('works for getters and setters for ' + key, function() {
          expect(el[key].toValue()).to.deep.equal(meta[key]);
        });

        it('stores the correct data in meta for ' + key, function() {
          expect(el.meta.get(key).toValue()).to.deep.equal(meta[key])
        });
      });
    });
  });

  describe('removing meta properties', function() {
    var el = minim.fromRefract({
      element: 'string',
      meta: {
        id: 'foobar',
        classes: ['a'],
        title: 'A Title',
        description: 'A Description'
      }
    });

    it('should allow removing property', function () {
      el.meta.remove('title');
      expect(el.meta.keys()).to.deep.equal(['id', 'classes', 'description']);
    });
  });

  describe('removing attribute properties', function() {
    var el = minim.fromRefract({
      element: 'string',
      attributes: {
        href: 'foobar',
        relation: 'create'
      }
    });

    it('should allow removing property', function () {
      el.attributes.remove('href');
      expect(el.attributes.keys()).to.deep.equal(['relation']);
    });
  });

  describe('hyperlinking', function() {
    context('when converting from Refract with links', function() {
      var el;

      before(function() {
        el = minim.fromRefract({
          element: 'string',
          meta: {
            links: [
              {
                element: 'link',
                attributes: {
                  relation: 'foo',
                  href: '/bar'
                }
              }
            ]
          },
          content: 'foobar'
        })
      });

      it('correctly loads the links', function() {
        var link = el.meta.get('links').first();
        expect(link.element).to.equal('link');
        expect(link.relation.toValue()).to.equal('foo');
        expect(link.href.toValue()).to.equal('/bar');
      });
    });

    describe('#links', function() {
      context('when `links` is empty', function() {
        var el;

        before(function() {
          // String with no links
          el = minim.fromRefract({
            element: 'string',
            content: 'foobar'
          });
        });

        it('returns an empty array', function() {
          expect(el.links).to.have.length(0);
          expect(el.links.toValue()).to.deep.equal([]);
        });
      });

      context('when there are existing `links`', function() {
        var el;

        context('refract', function() {
          before(function() {
            el = minim.fromRefract({
              element: 'string',
              meta: {
                links: [
                  {
                    element: 'link',
                    attributes: {
                      relation: 'foo',
                      href: '/bar'
                    }
                  }
                ]
              },
              content: 'foobar'
            });
          });

          it('provides the links from meta', function() {
            var link = el.links.first();
            expect(el.links).to.have.length(1);
            expect(link.relation.toValue()).to.equal('foo');
            expect(link.href.toValue()).to.equal('/bar');
          });
        });
      });
    });
  });

  context('when querying', function() {
    it('returns empty array when there are no matching elements', function() {
      const element = new minim.BaseElement();
      const result = element.findRecursive('string');

      expect(result.length).to.equal(0);
    });

    it('finds direct element', function() {
      const StringElement = minim.getElementClass('string');
      const element = new minim.BaseElement(
        new StringElement('Hello World')
      );

      const result = element.findRecursive('string');

      expect(result.element).to.equal('array');
      expect(result.toValue()).to.deep.equal(['Hello World']);
    });

    it('finds direct element inside array', function() {
      const ArrayElement = minim.getElementClass('array');
      const StringElement = minim.getElementClass('string');
      const NumberElement = minim.getElementClass('number');
      const element = new ArrayElement([
        new StringElement('One'),
        new NumberElement(2),
        new StringElement('Three'),
      ]);

      const result = element.findRecursive('string');

      expect(result.element).to.equal('array');
      expect(result.toValue()).to.deep.equal(['One', 'Three']);
    });

    it('finds direct element inside object', function() {
      const ObjectElement = minim.getElementClass('object');
      const MemberElement = minim.getElementClass('member');
      const StringElement = minim.getElementClass('string');
      const NumberElement = minim.getElementClass('number');

      const element = new ObjectElement();
      element.push(new MemberElement(new StringElement('key1'), new NumberElement(1)));
      element.push(new MemberElement(new NumberElement(2), new StringElement('value2')));

      const result = element.findRecursive('string');

      expect(result.element).to.equal('array');
      expect(result.toValue()).to.deep.equal(['key1', 'value2']);
    });

    it('finds non-direct element inside element', function() {
      const StringElement = minim.getElementClass('string');

      const element = new minim.BaseElement(
        new minim.BaseElement(
          new StringElement('Hello World')
        )
      );

      const result = element.findRecursive('string');

      expect(result.element).to.equal('array');
      expect(result.toValue()).to.deep.equal(['Hello World']);
    });

    it('finds non-direct element inside array', function() {
      const StringElement = minim.getElementClass('string');
      const ArrayElement = minim.getElementClass('array');

      const element = new minim.BaseElement(
        new ArrayElement([
          new StringElement('Hello World')
        ])
      );

      const result = element.findRecursive('string');

      expect(result.element).to.equal('array');
      expect(result.toValue()).to.deep.equal(['Hello World']);
    });

    it('finds non-direct element inside object', function() {
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

      expect(result.element).to.equal('array');
      expect(result.toValue()).to.deep.equal(['key1', 'value2']);
    });

    it('attaches parent tree to found objects', function () {
      const StringElement = minim.getElementClass('string');
      const ArrayElement = minim.getElementClass('array');

      const hello = new StringElement('Hello World')
      const array = new ArrayElement([hello]);
      const element = new ArrayElement([array]);
      array.id = 'Inner';
      element.id = 'Outter';

      const result = element.findRecursive('string');

      expect(result.element).to.equal('array');
      expect(result.toValue()).to.deep.equal(['Hello World']);

      const helloElement = result.first();
      const parentIDs = helloElement.parents.map(function (item) {
        return item.id.toValue();
      });
      expect(parentIDs).to.deep.equal(['Inner', 'Outter']);
    });

    it('finds elements contained in given elements', function () {
      const StringElement = minim.getElementClass('string');
      const ArrayElement = minim.getElementClass('array');
      const ObjectElement = minim.getElementClass('object');
      const MemberElement = minim.getElementClass('member');

      const object = new ObjectElement();
      object.push(new MemberElement(
        new StringElement('Three'),
        new ArrayElement([
          new StringElement('Four')
        ])
      ));

      const element = new ArrayElement([
        new StringElement('One'),
        object
      ]);

      const result = element.findRecursive('member', 'array', 'string');

      expect(result.element).to.equal('array');
      expect(result.toValue()).to.deep.equal(['Four']);
    });
  });
});
