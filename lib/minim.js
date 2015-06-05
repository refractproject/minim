'use strict';

var _ = require('lodash');
var base = require('./base');
var registry = base.registry;

// Set up classes for default element types
registry
  .register('null', base.NullType)
  .register('string', base.StringType)
  .register('number', base.NumberType)
  .register('boolean', base.BooleanType)
  .register('array', base.ArrayType)
  .register('object', base.ObjectType)
  .register('member', base.MemberType);

// Add instance detection functions to convert existing objects into
// the corresponding refract types.
registry
  .detect(_.isNull, base.NullType, false)
  .detect(_.isString, base.StringType, false)
  .detect(_.isNumber, base.NumberType, false)
  .detect(_.isBoolean, base.BooleanType, false)
  .detect(_.isArray, base.ArrayType, false)
  .detect(_.isObject, base.ObjectType, false);

module.exports = _.extend({
    convertToType: function() {
      return registry.toType.apply(registry, arguments);
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
