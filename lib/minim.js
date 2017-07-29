'use strict';

var Namespace = require('./namespace');

// Direct access to the Namespace class
exports.Namespace = Namespace;

// Special constructor for the Namespace class
exports.namespace = function namespace(options) {
  return new Namespace(options);
};

exports.Element = require('./primitives/element');
exports.KeyValuePair = require('./key-value-pair');
exports.StringElement = require('./primitives/string-element');
exports.NumberElement = require('./primitives/number-element');
exports.BooleanElement = require('./primitives/boolean-element');
exports.NullElement = require('./primitives/null-element');
exports.ArrayElement = require('./primitives/array-element');
exports.ObjectElement = require('./primitives/object-element');
exports.MemberElement = require('./primitives/member-element');
exports.RefElement = require('./elements/ref-element');
exports.LinkElement = require('./elements/link-element');
exports.ArraySlice = require('./array-slice');
exports.ObjectSlice = require('./object-slice');
