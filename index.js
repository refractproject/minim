var _ = require('lodash');

// Polyfill for some ES6 features like private class symbols
require('core-js/es6');

module.exports = _.extend(
  require('./lib/primitives'),
  require('./lib/convert')
);
