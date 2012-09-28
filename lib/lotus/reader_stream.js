/*!
 * Lotus - ReaderStream
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * External dependancies
 */

var Buffers = require('bufs')
  , Stream = require('stream')
  , util = require('util');

/*!
 * Primary export
 */

module.exports = ReaderStream;

function ReaderStream () {
  // setup stream
  Stream.call(this);
  this.readable = true;
  this.writable = true;

  // defaults
  this.queue = new Buffers();
  this.stack = {};
  this.processing = false;
}

/*!
 * Inherits from Stream
 */

util.inherits(ReaderStream, Stream);

/**
 * #### .use (id, reader)
 *
 * Specify a protocol id and reader to use
 * for an incoming message. Protocol id must be
 * between 0-9 and the reader can either be a function
 * or an instance of the reader dsl.
 *
 * @param {Number} protocol id (0-9)
 * @param {Function|Object} handler function or dsl
 * @returns {this} for chaining
 * @name use
 * @api public
 */

ReaderStream.prototype.use = function (id, dsl) {
  if (this.stack[id]) throw new Error('Already defined');
  this.stack[id] = dsl;
  return this;
};

/**
 * #### .write (chunk)
 *
 * Add a buffered chunk to the processing queue. Must
 * be an instance of `Buffer`.
 *
 * @param {Buffer} data chunk
 * @returns
 * @name write
 * @api public
 */

ReaderStream.prototype.write = function (chunk) {
  this.queue.push(chunk);
  if (!this.processing) processNext.call(this);
};

/*!
 * processNext ()
 *
 * Will be invoked at the start of each new message.
 * Since a single message may arrive in multiple
 * chunks, it is assumed to be asyncronous in nature.
 *
 * @api private
 */

function processNext () {
  if (this.processing) return;
  if (this.queue.length === 0) return;
  this.processing = true;

  var self = this
    , queue = this.queue
    , proto = queue.splice(0, 1)
    , dsl = this.stack[proto];

  if (!dsl) throw new Error('Protocol not defined.');

  function handleErr (err) {
    self.emit('error', err);
  }

  dsl.handle(queue, function (err, msg) {
    if (err) return handleErr(err);
    self.emit('data', msg);
    self.processing = false;
    process.nextTick(processNext.bind(self));
  });
}
