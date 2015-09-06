'use strict';

exports.namespace = function(options) {
  var base = options.base;
  base.use(require('./embedded-refract/from-embedded'));
  base.use(require('./embedded-refract/to-embedded'));
  return base;
};
