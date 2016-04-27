'use strict';

exports.namespace = function(options) {
  var base = options.base;

  base.use(require('./from-embedded'));
  base.use(require('./to-embedded'));

  return base;
};
