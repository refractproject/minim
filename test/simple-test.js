var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');
var Element = minim.Element;
var StringElement = minim.StringElement;
var NumberElement = minim.NumberElement;
var ArrayElement = minim.ArrayElement;


describe('Performance Test', function () {
  it('testing original', function () {
    for (var counter = 0; counter < 5000; ++counter) {
      var sourceMap = new ArrayElement([
        new ArrayElement([
          new NumberElement(15),
          new NumberElement(10),
        ])
      ]);
      sourceMap.element = 'sourceMap';
      var element = new StringElement('hello');
      element.attributes.set('sourceMap', new ArrayElement([sourceMap]));
    }
  });
});
