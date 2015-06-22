'use strict';

module.exports = function(BaseElement) {
  return BaseElement.extend({
    constructor: function() {
      BaseElement.apply(this, arguments);
      this.element = 'boolean';
    },

    primitive: function() {
      return 'boolean';
    }
  });
};
