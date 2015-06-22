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
  .register('member', base.MemberElement);

// Add instance detection functions to convert existing objects into
// the corresponding refract elements.
registry
  .detect(_.isNull, base.NullElement, false)
  .detect(_.isString, base.StringElement, false)
  .detect(_.isNumber, base.NumberElement, false)
  .detect(_.isBoolean, base.BooleanElement, false)
  .detect(_.isArray, base.ArrayElement, false)
  .detect(_.isObject, base.ObjectElement, false);

function convertFromEmbedded(value) {
  var element;

  if (_.isArray(value)) {
    element = new base.ArrayElement();

    _.forEach(value, function(item) {
      element.push(convertFromEmbedded(item));
    });

    return element;
  }

  if (_.isObject(value)) {
    if (_.has(value, 'refract')) {
      element = registry.fromRefract(value.refract);
    } else {
      element = new base.ObjectElement();
    }

    // Objects get the properties of the object set as members
    // All other get the properties set as attributes
    element.fromEmbeddedRefract(convertFromEmbedded, _.omit(value, 'refract'));

    return element;
  }

  return registry.toElement(value);
}

module.exports = _.extend({
    convertToElement: function() {
      return registry.toElement.apply(registry, arguments);
    },
    convertFromRefract: function() {
      return registry.fromRefract.apply(registry, arguments);
    },
    convertFromCompactRefract: function() {
      return registry.fromCompactRefract.apply(registry, arguments);
    },
    convertFromEmbedded: convertFromEmbedded
  },
  base
);
