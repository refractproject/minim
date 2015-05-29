import _ from 'lodash';
import * as primitives from './primitives';
import registry from './registry';

// Set up classes for default element types
registry
  .register('null', primitives.NullType)
  .register('string', primitives.StringType)
  .register('number', primitives.NumberType)
  .register('boolean', primitives.BooleanType)
  .register('array', primitives.ArrayType)
  .register('object', primitives.ObjectType)
  .register('member', primitives.MemberType);

// Add instance detection functions to convert existing objects into
// the corresponding refract types.
registry
  .detect(_.isNull, primitives.NullType, false)
  .detect(_.isString, primitives.StringType, false)
  .detect(_.isNumber, primitives.NumberType, false)
  .detect(_.isBoolean, primitives.BooleanType, false)
  .detect(_.isArray, primitives.ArrayType, false)
  .detect(_.isObject, primitives.ObjectType, false);

export default _.extend({
    registry,
    convertToType: (...args) => registry.toType(...args),
    convertFromRefract: (...args) => registry.fromRefract(...args),
    convertFromCompactRefract: (...args) => registry.fromCompactRefract(...args)
  },
  require('./primitives')
);
