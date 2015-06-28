var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim');

describe('BaseElement', function() {
  context('when initializing', function() {
    var el;

    before(function() {
      el = new minim.BaseElement({}, {
        id: 'foobar',
        class: ['a', 'b'],
        title: 'Title',
        description: 'Description'
      });
    });

    it('should initialize the correct meta data', function() {
      expect(el.meta.get('id').toValue()).to.equal('foobar');
      expect(el.meta.get('class').toValue()).to.deep.equal(['a', 'b']);
      expect(el.meta.get('title').toValue()).to.equal('Title');
      expect(el.meta.get('description').toValue()).to.equal('Description');
    });

    it('has empty parents', function() {
      expect(el.parents).to.deep.equal([]);
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
      expect(el.id.equals('foobar')).to.be.true;
    });

    it('returns false when they are not equal', function() {
      expect(el.id.equals('not-equal')).to.be.false;
    });

    it('does a deep equality check', function() {
      expect(el.equals({ foo: 'bar'})).to.be.true;
      expect(el.equals({ foo: 'baz'})).to.be.false;
    });
  });

  describe('convenience methods', function() {
    var meta = {
      id: 'foobar',
      'class': ['a'],
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
});
