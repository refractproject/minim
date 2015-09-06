'use strict';

var _ = require('lodash');

exports.namespace = function(options) {
  var base = options.base;
  var parseArray;
  var parseObject;
  var handleNormalObject;
  var handleRefractObject;
  var handleContentArray;
  var handleContentObject;
  var overwriteFromObject;
  var parseAndSetAsContent;
  var getObjectKeys;
  var isRefracted;
  var refractProperty = '_refract';

  /*
   * Attaches parsing function to the given namespace
   */
  base.fromEmbeddedRefract = function(value) {
    // Important to test for array first because they are also objects
    // Each item of an array can be refracted
    if (_.isArray(value)) { return parseArray(value); }

    // Objects can be normal objects or refracted objects
    if (_.isObject(value)) { return parseObject(value); }

    // If we've made it here, we know the value is a simple value item with no
    // need for extra parsing. We can treat it as a primitive value.
    return base.toElement(value);
  };

  parseArray = function(value) {
    var ElementClass = base.getElementClass('array');
    var element = new ElementClass();

    // Items in an array can be embedded Refract
    _.forEach(value, function(item) {
      element.push(base.fromEmbeddedRefract(item));
    });

    return element;
  };

  parseObject = function(value) {
    // The refract property instructs the parser that additional parsing is
    // needed. If this property is not set, the object is treated just like a
    // a regular object literal.
    if (isRefracted(value)) {
      return handleRefractObject(value);
    } else {
      return handleNormalObject(value);
    }
  };

  handleNormalObject = function(value) {
    var ElementClass = base.getElementClass('object');
    var element = new ElementClass();

    _.forEach(getObjectKeys(value), function(key) {
      element.set(key, base.fromEmbeddedRefract(value[key]));
    });

    return element;
  };

  handleRefractObject = function(value) {
    var element;
    var ElementClass = base.getElementClass(value[refractProperty].element);
    var refractObject = value[refractProperty];

    // Object elements are treated differently than other elements. If the
    // element is not an object, just store the content (if defined).
    if (refractObject.element === 'object') {
      element = new ElementClass();
      // Content as array means it is an array of member elements
      // Otherise, parse as embedded refract and set they key equal to each
      // value. This is essentially a shallow merge.
      if (_.isArray(refractObject.content)) {
        handleContentArray(element, value, refractObject.content);
      } else {
        handleContentObject(element, value, refractObject.content);
      }
    } else {
      element = new ElementClass(refractObject.content);
    }

    parseAndSetAsContent(refractObject.attributes, element.attributes);
    parseAndSetAsContent(refractObject.meta, element.meta);

    return element;
  };

  handleContentArray = function(element, value, content) {
    _.forEach(content, function(member) {
      var memberKey = base.fromEmbeddedRefract(member.key);
      element.set(memberKey.toValue(), base.fromEmbeddedRefract(member.value));
      var memberElement = element.getMember(memberKey.toValue());

      // Even member elements may be refracted, so we handle accordingly
      if (_.has(member, refractProperty)) {
        parseAndSetAsContent(member[refractProperty].attributes, memberElement.attributes);
        parseAndSetAsContent(member[refractProperty].meta, memberElement.meta);
      }
    });

    overwriteFromObject(element, value);

    return element;
  };

  handleContentObject = function(element, value, content) {
    base.fromEmbeddedRefract(content || {}).forEach(function(valueElement, keyElement) {
      element.set(keyElement.toValue(), valueElement);
    });

    overwriteFromObject(element, value);

    return element;
  };

  /*
   * Allows for the original object's values to overwrite
   * those of the refracted object
   */
  overwriteFromObject = function(element, value) {
    // This section allows for the original object's values to overwrite
    // those of the refracted object
    _.forEach(getObjectKeys(value), function(key) {
      var existingElement = element.get(key);

      if (existingElement && !isRefracted(value[key])) {
        // This allows us to retain meta and attributes
        existingElement.content = base.fromEmbeddedRefract(value[key]).content;
      } else {
        element.set(key, base.fromEmbeddedRefract(value[key]));
      }
    });
  };

  parseAndSetAsContent = function(fromValue, toValue) {
    if (!_.isEmpty(fromValue)) {
      // Setting content allows us to retain meta and attributes
      toValue.content = base.fromEmbeddedRefract(fromValue).content;
    }
  };

  getObjectKeys = function(value) {
    var content = _.omit(value, refractProperty);
    return _.isEmpty(content) ? [] : _.keys(content);
  };

  isRefracted = function(value) {
    if (_.isObject(value) && _.has(value, refractProperty)) {
      return true;
    }
    return false;
  };

  return base;
};
