'use strict';

var Element = require('../primitives/element');

/**
 * @class RefElement
 *
 * @param content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
class RefElement extends Element {
  constructor(...args) {
    super(...args);
    this.element = 'ref';

    if (!this.path) {
      this.path = 'element';
    }
  }

  /**
   * @type StringElement
   * @memberof RefElement.prototype
   */
  get path() {
      return this.attributes.get('path');
    }

    set path(newValue) {
      this.attributes.set('path', newValue);
  }
}

module.exports = RefElement;
