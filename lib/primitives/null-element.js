'use strict';

var Element = require('./element');

/**
 * @class NullElement
 * @extends Element
 */
class NullElement extends Element {
  constructor() {
    super();
    this.element = 'null';
  }

  primitive() {
    return 'null';
  }

  set() {
    return new Error('Cannot set the value of null');
  }
}

module.exports = NullElement;
