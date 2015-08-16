'use strict';

// Provide a common interface to Minim
// This allows for the base initialization code to be used and custom registries
// to be created rather than have one global registry.
module.exports = require('./base').init();
