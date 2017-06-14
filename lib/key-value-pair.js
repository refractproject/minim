'use strict';

var uptown = require('uptown');
var createClass = uptown.createClass;

var KeyValuePair = createClass({
  constructor: function(key, value) {
    this.key = key;
    this.value = value;
    this.parent = null;
  },

  clone: function() {
    var clone = new KeyValuePair();

    if (this.key) {
      clone.key = this.key.clone();
    }

    if (this.value) {
      clone.value = this.value.clone();
    }

    return clone;
  },
}, {}, {
  parent: {
    get: function() {
      return this._parent;
    },

    set: function(newValue) {
      this._parent = newValue;

      if (this.key) {
        this.key.parent = newValue;
      }

      if (this.value) {
        this.value.parent = newValue;
      }
    }
  },

  key: {
    get: function() {
      return this._key;
    },

    set: function(newValue) {
      if (this._key) {
        this._key.parent = null;
      }

      this._key = newValue;

      if (newValue) {
        newValue.parent = this.parent;
      }
    }
  },

  value: {
    get: function() {
      return this._value;
    },

    set: function(newValue) {
      if (this._value) {
        this._value.parent = null;
      }

      this._value = newValue;

      if (newValue) {
        newValue.parent = this.parent;
      }
    }
  }
});

module.exports = KeyValuePair;
