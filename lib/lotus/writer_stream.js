/*!
 * Lotus - WriterStream
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

module.exports = WriterStream;

function WriterStream () {
  // setup stream
  Stream.call(this);

  // states
  this.readable = true;
  this.writable = true;
  this.paused = false;
  this.processing = false;

  // defaults
  this.queue = [];
  this.stack = {};
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

WriterStream.prototype.use = function (id, fn) {
  if (fn.handle && 'function' === typeof fn.handle) {
    fn = fn.handle;
  }

  if (this.stack[id]) throw new Error('Already defined');
  this.stack[id] = fn;
  return this;
};

/**
 * #### .write (chunk)
 *
 * Add a message object to the processing queue.
 *
 * @param {Mixed} data message
 * @returns {Boolean} added to queue
 * @name write
 * @api public
 */

WriterStream.prototype.write = function (id, msg) {
  if (!this.writable) return false;
  this.queue.push({ id: id, msg: msg });
  processNext.call(this);
  return true;
};

/**
 * #### .end ()
 *
 * Terminates the accaptance of new data. Any data queued
 * for encoding will be handled prior to emit of `end`.
 *
 * @name end
 * @api public
 */

WriterStream.prototype.end = function () {
  if (arguments.length > 0) this.write.apply(this, arguments);
  this.writable = false;
  if (this.queue.length === 0) this.emit('end');
};

/**
 * #### .pause ()
 *
 * Delay the processing of the message queue until `.resume()`
 * is invoked. Will complete the current message that is
 * encoding so may emit a `data` event after `.pause()` is
 * invoked.
 *
 * @name pause
 * @api public
 */

WriterStream.prototype.pause = function () {
  this.paused = true;
};

/**
 * #### .resume ()
 *
 * Resume the processing of the message queue.
 *
 * @name pause
 * @api public
 */

WriterStream.prototype.resume = function () {
  this.paused = false;
  processNext.call(this);
};

/*!
 * processNext ()
 *
 * Will be invoked at the start of each new message.
 * Message generation can be asyncronous.
 *
 * @api private
 */

function processNext () {
  if (this.processing) return;
  if (this.paused) return;
  if (this.queue.length === 0) return;

  this.processing = true;

  var self = this
    , line = this.queue.shift()
    , id = line.id
    , dsl = this.stack[id]
    , bufs = new Buffers();

  bufs.push(new Buffer([ id ]));

  if (!dsl) throw new Error('Protocol not defined.');

  function handleErr (err) {
    self.processing = false;
    self.writable = false;
    self.emit('error', err);
  }

  dsl(line.msg, function (err, chunk) {
    if (err) return handleErr(err);
    bufs.push(chunk);
    self.emit('data', bufs.slice());
    self.processing = false;

    if (!self.writable) {
      self.emit('end');
    } else if (!self.paused) {
      processNext.call(self);
    }
  });
}
