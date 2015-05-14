var _ = require('lodash');

module.exports = _.extend(
  require('./lib/primitives'),
  require('./lib/convert')
);
