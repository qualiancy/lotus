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

  // states
  this.readable = true;
  this.writable = true;
  this.paused = false;
  this.processing = false;
  this.singleStack = false;

  // defaults
  this.queue = new Buffers();
  this.stack = {};
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

ReaderStream.prototype.use = function (id, fn) {
  if (this.singleStack && arguments.length > 1) {
    throw new Error('Cannot convert stream to multiple decoders.');
  }

  if ('function' === typeof id) {
    fn = id;
    id = -1;
    this.singleStack = true;
  }

  if (fn.handle && 'function' === typeof fn.handle) {
    fn = fn.handle;
  }

  if (this.stack[id]) {
    throw new Error('Already defined');
  }

  this.stack[id] = fn;
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
  if (!this.writable) return false;
  this.queue.push(chunk);
  process.nextTick(processNext.bind(this));
  return true;
};

/**
 * #### .end ()
 *
 * Terminates the accaptance of new data. Any data queued
 * for parsing will be handled prior to emit of `end`.
 *
 * @name end
 * @api public
 */

ReaderStream.prototype.end = function () {
  if (arguments.length > 0) this.write.apply(this, arguments);
  this.writable = false;
  if (this.queue.length === 0) this.emit('end');
};

/**
 * #### .pause ()
 *
 * Delay the processing of the buffer queue until `.resume()`
 * is invoked. Will complete the current message that is
 * parsing so may emit a `data` event after `.pause()` is
 * invoked.
 *
 * @name pause
 * @api public
 */

ReaderStream.prototype.pause = function () {
  this.paused = true;
};

/**
 * #### .resume ()
 *
 * Resume the processing of the buffer queue.
 *
 * @name pause
 * @api public
 */

ReaderStream.prototype.resume = function () {
  this.paused = false;
  process.nextTick(processNext.bind(this));
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
  if (this.paused) return;
  if (this.queue.length === 0) return;

  this.processing = true;

  var self = this
    , queue = this.queue
    , proto = this.singleStack ? -1 : queue.splice(0, 1).at(0)
    , dsl = this.stack[proto];

  function handleErr (err) {
    self.processing = false;
    self.writable = false;
    self.emit('error', err);
  }

  if (!dsl) return handleErr(new Error('Protocol not defined.'));

  dsl(queue, function (err, msg) {
    if (err) return handleErr(err);
    self.emit('data', msg);
    self.processing = false;

    if (!self.writable && self.queue.length === 0) {
      self.emit('end');
    } else if (!self.paused) {
      processNext.call(self);
    }
  });
}
