'use strict';

var _ = require('lodash');

var valueToRefract;
var arrayToRefract;
var objectToRefract;
var memberToRefract;
var shouldRefract;
var shouldRefractObject;
var shouldUseMembers;
var refractArrayContent;
var setUpRefractObj;
var populateObjFromElement;
var populateContentFromMembers;

exports.namespace = function(options) {
  var base = options.base;
  var ArrayElement = base.getElementClass('array');
  var ObjectElement = base.getElementClass('object');
  var MemberElement = base.getElementClass('member');

  // Value elements may be treated the same way
  ['string', 'number', 'boolean', 'null'].forEach(function(elementName) {
    var ElementClass = base.getElementClass(elementName);
    ElementClass.prototype.toEmbeddedRefract = valueToRefract;
  });

  // Array elements require that each item be converted
  ArrayElement.prototype.toEmbeddedRefract = arrayToRefract;

  // Objects have several special serialization rules
  ObjectElement.prototype.toEmbeddedRefract = objectToRefract;

  // Member elements have special rules that separate it from other elements
  MemberElement.prototype.toEmbeddedRefract = memberToRefract;

  return base;
};

valueToRefract = function() {
  var obj = {};

  if (shouldRefract(this)) {
    setUpRefractObj(obj, this, this.toValue());
    return obj;
  }

  // Value elements do not need to be converted to embedded
  // This would cause an infinite loop
  return this.toValue();
};

arrayToRefract = function() {
  var obj = {};

  if (shouldRefract(this)) {
    setUpRefractObj(obj, this, refractArrayContent(this.content));
    return obj;
  }

  return refractArrayContent(this.content);
};

objectToRefract = function() {
  var obj = {};

  if (shouldRefractObject(this)) {
    setUpRefractObj(obj, this);

    // We either create an array of members or add the key/values directly to
    // the main object. A scenario not handled here is that you could serialize
    // the content as an object as well, but that is unnecessary.
    if (shouldUseMembers(this)) {
      populateContentFromMembers(obj, this);
    } else {
      populateObjFromElement(obj, this);
    }

    return obj;
  }

  populateObjFromElement(obj, this);

  return obj;
};

memberToRefract = function() {
  var obj = {};

  // Only include refract object if necessary. This is a different practice than
  // other formats. A member element here acts a lot like an object.
  if (shouldRefract(this)) {
    setUpRefractObj(obj, this);
  }

  obj.key = this.key.toEmbeddedRefract();
  obj.value = this.value.toEmbeddedRefract();

  return obj;
};

shouldRefract = function(element) {
  if (element.element !== 'member' && (element.element !== element.primitive())) {
    return true;
  }

  if (element.attributes.length > 0 || element.meta.length > 0) {
    return true;
  }

  return false;
};

/*
 * Objects can be refracted if their members meet certain conditions
 */
shouldRefractObject = function(element) {
  return shouldRefract(element) || shouldUseMembers(element);
};

shouldUseMembers = function(element) {
  return _.reduce(element.content, function(memo, memberElement) {
    return shouldRefract(memberElement) || shouldRefract(memberElement.key) ? true : memo;
  }, false);
};

refractArrayContent = function(content) {
  return (content || []).map(function(item) {
    return item.toEmbeddedRefract();
  });
};

setUpRefractObj = function(obj, element, content) {
  obj._refract = { element: element.element };

  if (element.meta.length > 0) {
    obj._refract.meta = element.meta.toEmbeddedRefract();
  }

  if (element.attributes.length > 0) {
    obj._refract.attributes = element.attributes.toEmbeddedRefract();
  }

  if (content !== undefined) {
    obj._refract.content = content;
  }

  return obj;
};

populateObjFromElement = function(obj, element) {
  element.forEach(function(valueElement, keyElement) {
    obj[keyElement.toValue()] = valueElement.toEmbeddedRefract();
  });
  return obj;
};

populateContentFromMembers = function(obj, element) {
  obj._refract.content = [];
  element.forEach(function(valueElement, keyElement, memberElement) {
    obj._refract.content.push(memberElement.toEmbeddedRefract());
  });
  return obj;
};
