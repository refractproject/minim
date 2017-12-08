'use strict';

var Element = require('../primitives/element');

/**
 * @param content
 * @param meta
 * @param attributes
 */
class RefElement extends Element {
  constructor(content, meta, attributes) {
    super(content, meta, attributes);

    this.element = 'ref';

    if (!this.path) {
      this.path = 'element';
    }
  }

  /**
   * @type StringElement
   */
  get path() {
    return this.attributes.get('path');
  }

  set path(newValue) {
    this.attributes.set('path', newValue);
  }
}

module.exports = RefElement;
