'use strict';

const Element = require('../primitives/element');

/**
 * @class LinkElement
 *
 * @param content
 * @param meta
 * @param attributes
 */
class LinkElement extends Element {
  constructor(content, meta, attributes) {
    super(content || [], meta, attributes);
    this.element = 'link';
  }

  /**
   * @type StringElement
   */
  get relation() {
    return this.attributes.get('relation');
  }

  set relation (relation) {
    this.attributes.set('relation', relation);
  }

  /**
   * @type StringElement
   */
  get href() {
    return this.attributes.get('href');
  }

  set href(href) {
    this.attributes.set('href', href);
  }
}

module.exports = LinkElement;
