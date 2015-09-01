'use strict';

var ElementRegistry = require('./registry');

// Initiate a default Minim registry
var defaultRegistry = new ElementRegistry();

// Expose the element registry class so custom registries can be created
defaultRegistry.ElementRegistry = ElementRegistry;

module.exports = defaultRegistry;
