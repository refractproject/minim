'use strict';

var fl = require('fantasy-land');
var expect = require('../spec-helper').expect;
var namespace = require('../../lib/minim').namespace();

var ArrayElement = namespace.getElementClass('array');

describe('ArrayElement', function() {
  var array = new ArrayElement([1, 2, 3, 4]);

  describe('Functor', function() {
    it('can transform elements into new ArrayElement', function() {
      var result = array[fl.map](function(n) {
        return new namespace.elements.Number(n.toValue() * 2);
      });

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([2, 4, 6, 8]);
    });
  });

  describe('Semigroup', function() {
    it('can concatinate two array elements', function() {
      var result = array[fl.concat](new ArrayElement([5, 6]));

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('Monoid', function() {
    it('can create an empty ArrayElement', function() {
      var result = ArrayElement[fl.empty]();

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([]);
    });

    it('can create an empty ArrayElement from another ArrayElement', function() {
      var result = array[fl.empty]();

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([]);
    });
  });

  describe('Filterable', function() {
    it('can filter all elements into equivilent ArrayElement', function() {
      var result = array[fl.filter](function() { return true; });

      expect(result).to.deep.equal(array);
    });

    it('can filter into empty ArrayElement', function() {
      var result = array[fl.filter](function() { return false; });

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.isEmpty).to.be.true;
    });
  });

  describe('Chain', function() {
    it('can transform and chain results into new ArrayElement', function() {
      var duplicate = function(n) { return new ArrayElement([n, n]); };
      var result = array[fl.chain](duplicate);

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 1, 2, 2, 3, 3, 4, 4]);
    });
  });

  describe('Foldable', function() {
    it('can reduce results into new ArrayElement', function() {
      var result = array[fl.reduce](function (accumulator, element) {
        return accumulator.concat(new ArrayElement([element.toValue(), element.toValue()]));
      }, new ArrayElement());

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 1, 2, 2, 3, 3, 4, 4]);
    });
  });
});
