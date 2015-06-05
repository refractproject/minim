require('mocha-sinon');

exports.chai = require('chai');
exports.sinon = require('sinon');
exports.sinonChai = require('sinon-chai');

// Configure mocking
exports.chai.use(exports.sinonChai);
exports.expect = exports.chai.expect;
