'use strict';

var Namespace = require('./namespace');
var elements = require('./elements');

// Direct access to the Namespace class
exports.Namespace = Namespace;

// Special constructor for the Namespace class
exports.namespace = function namespace(options) {
  return new Namespace(options);
};

exports.KeyValuePair = require('./key-value-pair');
exports.ArraySlice = require('./array-slice');
exports.ObjectSlice = require('./object-slice');

exports.Element = elements.Element;
exports.StringElement = elements.StringElement;
exports.NumberElement = elements.NumberElement;
exports.BooleanElement = elements.BooleanElement;
exports.NullElement = elements.NullElement;
exports.ArrayElement = elements.ArrayElement;
exports.ObjectElement = elements.ObjectElement;
exports.MemberElement = elements.MemberElement;
exports.RefElement = elements.RefElement;
exports.LinkElement = elements.LinkElement;
