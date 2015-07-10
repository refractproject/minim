'use strict';

var _ = require('lodash');

module.exports = function(BaseElement) {
  return BaseElement.extend({
    constructor: function(value, meta, attributes) {
      var content = {};

      if (_.isString(value)) {
        content.href = value;
      }

      if (_.isObject(value)) {
        content = _.pick(value, 'href', 'path')
      }

      this.element = 'ref';

      BaseElement.call(this, content, meta, attributes);
    }
  });
};
