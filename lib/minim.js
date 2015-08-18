'use strict';

var base = require('./base');

module.exports = {
  init: base.init,
  ElementRegistry: require('../lib/registry').ElementRegistry
};
