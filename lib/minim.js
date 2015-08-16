'use strict';

var _ = require('lodash');
var base = require('./base');
var registry = base.registry;

module.exports = _.extend({
    convertToElement: function() {
      return registry.toElement.apply(registry, arguments);
    },
    convertFromRefract: function() {
      return registry.fromRefract.apply(registry, arguments);
    },
    convertFromCompactRefract: function() {
      return registry.fromCompactRefract.apply(registry, arguments);
    }
  },
  base
);
