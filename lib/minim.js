'use strict';

var _ = require('lodash');
var base = require('./base');
var registry = base.registry;

// Set up classes for default elements
registry
  .register('null', base.NullElement)
  .register('string', base.StringElement)
  .register('number', base.NumberElement)
  .register('boolean', base.BooleanElement)
  .register('array', base.ArrayElement)
  .register('object', base.ObjectElement)
  .register('member', base.MemberElement)
  .register('ref', base.RefElement);

// Add instance detection functions to convert existing objects into
// the corresponding refract elements.
registry
  .detect(_.isNull, base.NullElement, false)
  .detect(_.isString, base.StringElement, false)
  .detect(_.isNumber, base.NumberElement, false)
  .detect(_.isBoolean, base.BooleanElement, false)
  .detect(_.isArray, base.ArrayElement, false)
  .detect(_.isObject, base.ObjectElement, false);

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
