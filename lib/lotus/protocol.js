
var EventEmitter = require('events').EventEmitter
  , util = require('util');

module.exports = Protocol;

function Protocol () {
  EventEmitter.call(this);
  this.settings = {};
  this.stack = [];
}

util.inherits(Protocol, EventEmitter);

Protocol.prototype.use = function (fn) {
  this.stack.push(fn);
};
