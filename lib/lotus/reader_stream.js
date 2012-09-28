/*!
 * Lotus - ReaderStream
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

module.exports = ReaderStream;

function ReaderStream () {
  Stream.call(this);
  this.readable = true;
  this.writable = true;
}

/*!
 * Inherits from Stream
 */

util.inherits(ReaderStream, Stream);
