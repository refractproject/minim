'use strict';

var uptown = require('uptown');
var createClass = uptown.createClass;

module.exports = createClass({
  constructor: function(key, value) {
    this.key = key;
    this.value = value;
  }
});
