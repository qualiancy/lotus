/*!
 * Lotus - WriterStream
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * External dependancies
 */

var Stream = require('stream')
  , util = require('util');

/*!
 * Primary export
 */

module.exports = WriterStream;

function WriterStream () {
  Stream.call(this);
  this.stack = {};
  this.readable = true;
  this.writable = true;
}

/*!
 * Inherits from Stream
 */

util.inherits(WriterStream, Stream);

/**
 * #### .use (id, reader)
 *
 * Specify a protocol id and writer to use
 * for an incoming message. Protocol id must be
 * between 0-9 and the reader can either be a function
 * or an instance of the writer dsl.
 *
 * @param {Number} protocol id (0-9)
 * @param {Function|Object} handler function or dsl
 * @returns {this} for chaining
 * @name use
 * @api public
 */

WriterStream.prototype.use = function (id, dsl) {
  if (this.stack[id]) throw new Error('Already defined');
  this.stack[id] = dsl;
  return this;
};

WriterStream.prototype.write = function (id, data) {

};
