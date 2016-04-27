var _ = require('lodash');
var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();

var ObjectElement = minim.getElementClass('object');
var StringElement = minim.getElementClass('string');

describe('Element whose meta has meta', function() {
  var object, string;

  before(function () {
    object = new ObjectElement({
      foo: 'bar'
    });

    string = new StringElement('xyz');
    string.meta.set('pqr', 1);

    object.meta.set('baz', string);
  });

  it('returns the correct Refract value', function() {
    expect(object.toRefract()).to.deep.equal({
      element: 'object',
      meta: {
        baz: {
          element: 'string',
          meta: {
            pqr: 1
          },
          attributes: {},
          content: 'xyz'
        }
      },
      attributes: {},
      content: [
        {
          element: 'member',
          meta: {},
          attributes: {},
          content: {
            key: {
              element: 'string',
              meta: {},
              attributes: {},
              content: 'foo'
            },
            value: {
              element: 'string',
              meta: {},
              attributes: {},
              content: 'bar'
            }
          }
        }
      ]
    });
  });
});
