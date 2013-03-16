var Buffers = require('bufs')
  , debug = require('sherlock')('lotus:decoder-stream')
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
 * Primary Exports
 */

module.exports = DecoderStream;

function DecoderStream (id, handle) {
  Readable.call(this, { objectMode: true, highWaterMark: 0 });

  // settings
  this.id = id;
  this._handle = handle;
  this._finished = false;
  this._queue = [];
}

inherits(DecoderStream, Readable);

DecoderStream.prototype._nudge = function (bufs, cb) {
  var self = this
    , handle = this._handle;

  handle(bufs, function (err, msg) {
    if (err) return cb(err);
    self._queue.push(msg);
    self.emit('_entry');
    cb();
  });
};

DecoderStream.prototype._finish = function () {
  this._finished = true;
  this.emit('_entry');
};

DecoderStream.prototype._read = function (n) {
  function respond () {
    debug('(read) push');
    var item = this._queue.shift();
    if (item) this.push(item);

    if (this._finished && !this._queue.length) {
      debug('(read) end');
      this.push(null);
    }
  }

  if (this._queue.length) {
    respond.call(this);
  } else if (this._finished) {
    debug('(read) end');
    this.push(null);
  } else {
    debug('(read) waiting');
    this.once('_entry', respond);
  }
};
