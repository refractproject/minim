var expect = require('../spec-helper').expect;
var minim = require('../../lib/minim').namespace();
var R = require('ramda');

var ArrayElement = minim.getElementClass('array');

describe('ArrayElement', function() {
  var array = new ArrayElement([1, 2, 3, 4]);

  it('#empty', function() {
    var result = R.empty(array);

    expect(result).to.be.instanceof(ArrayElement);
    expect(result.toValue()).to.deep.equal([]);
  });

  it('#map', function() {
    var result = R.map(function(item) { return item.toValue() * 2; }, array);

    expect(result).to.be.instanceof(ArrayElement);
    expect(result.toValue()).to.deep.equal([2, 4, 6, 8]);
  });

  it('#concat', function() {
    var result = R.concat(array, new ArrayElement([5, 6]));

    expect(result).to.be.instanceof(ArrayElement);
    expect(result.toValue()).to.deep.equal([1, 2, 3, 4, 5, 6]);
  });

  describe('#chain', function() {
    it('chaining when callback returns JS array', function() {
      var duplicate = function(n) { return [n, n]; };
      var result = R.chain(duplicate, array);

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 1, 2, 2, 3, 3, 4, 4]);
    });

    it('chaining when callback returns ArrayElement', function() {
      var duplicate = function(n) { return new ArrayElement([n, n]); };
      var result = R.chain(duplicate, array);

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 1, 2, 2, 3, 3, 4, 4]);
    });

    it('chaining when callback returns non-array element', function() {
      var duplicate = function(n) { return n; };
      var result = R.chain(duplicate, array);

      expect(result).to.be.instanceof(ArrayElement);
      expect(result.toValue()).to.deep.equal([1, 2, 3, 4]);
    });
  });
});
