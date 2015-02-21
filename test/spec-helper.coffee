'use strict'

require 'mocha-sinon'

chai = require 'chai'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'

# Configure mocking
chai.use sinonChai
expect = chai.expect

module.exports = {
  expect
  sinon
}
