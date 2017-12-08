'use strict';

var Element = require('../primitives/element');

/**
 * @class LinkElement
 *
 * @param content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
class LinkElement extends Element {
  constructor(content, meta, attributes) {
    super(content || [], meta, attributes);
    this.element = 'link';
  }

  /**
   * @type StringElement
   * @memberof LinkElement.prototype
   */
  get relation() {
      return this.attributes.get('relation');
    }

    set relation (relation) {
      this.attributes.set('relation', relation);
    }

  /**
   * @type StringElement
   * @memberof LinkElement.prototype
   */
    get href() {
      return this.attributes.get('href');
    }

    set href(href) {
      this.attributes.set('href', href);
    }
  }

module.exports = LinkElement;
