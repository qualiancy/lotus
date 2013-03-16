
var Buffers = require('bufs')
  , debug = require('sherlock')('lotus:encoder')
  , inherits = require('util').inherits
  , Readable = require('stream').Readable;

/*!
 * Node 0.8.x compat
 */

if (!Readable) {
  debug('(bootstrap) using node 0.8 compat');
  Readable = require('readable-stream');
}

/*!
 * Internal Dependencies
 */

var EncoderStream = require('./encoder-stream');

/*!
 * Primary Exports
 */

module.exports = Encoder;

function Encoder () {
  Readable.call(this);

  // settings / storage
  this._init = false;
  this._queue = new Buffers();
  this._singleStream = false;
  this._streams = Object.create(null);

  // incoming listener
  //this._entry = this._entry.bind(this);
}

/*!
 * Inherit from Readable Stream
 */

inherits(Encoder, Readable);

Encoder.prototype.stream = function (id, dsl) {
  // possibly convert to single stack
  if ('number' !== typeof id) {
    dsl = id;
    id = -1;
  }

  // construct stream
  var self = this
    , stream = this._streams[id]
    , err;

  // stop if stream already exists
  if (stream) return stream;

  // check to ensure not already tagged as single stack
  if (this._singleStream && arguments.length > 1) {
    err = new Error('Cannot convert Encoder to use multiple DSLs.');
  } else if (Object.keys(this._streams).length && id === -1) {
    err = new Error('Cannot convert Encoder to use single DSL.');
  }

  // bail if an error
  if (err) return this.emit('error', err);

  // return null for getter
  if (!dsl) return null;

  // convert dsl object to simple function with handle
  if (dsl.handle && 'function' === typeof dsl.handle) {
    dsl = dsl.handle;
  }

  // convert to single stack
  if (id === -1) {
    this._singleStream = true;
  }

  // construct stream
  stream = this._streams[id] = new EncoderStream(id, dsl);

  // listen for entries
  stream.on('entry', function (buf) {
    debug('(stream) [%d] entry: %d bytes', id, buf.length);
    self._queue.push(buf);
    self.emit('_entry');
  });

  // listen for writer ends
  stream.once('finish', function () {
    debug('(stream) [%d] finish', id);
    delete self._streams[id];
    self.emit('_entry');
  });

  // set init
  this._init = true;

  // notify
  debug('(stream) %d', id);
  this.emit('stream', stream);

  // return our new stream
  return stream;
};

Encoder.prototype._read = function (n) {
  debug('(read) %d bytes', n);

  function respond () {
    debug('(read) push: %d bytes', this._queue.length);
    var buf = this._queue.slice();
    this._queue.splice(0);
    if (buf) this.push(buf);

    if (this._init && !Object.keys(this._streams).length) {
      debug('(read) end');
      this.push(null);
    }
  }

  if (this._queue.length) {
    respond.call(this);
  } else if (this._init && !Object.keys(this._streams).length) {
    debug('(read) end');
    this.push(null);
  } else {
    debug('(read) waiting for entry');
    this.once('_entry', respond);
  }
};
