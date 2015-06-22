'use strict';

module.exports = function(BaseElement) {
  return BaseElement.extend({
    constructor: function() {
      BaseElement.apply(this, arguments);
      this.element = 'number';
    },

    primitive: function() {
      return 'number';
    }
  });
};
