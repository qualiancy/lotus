/*!
 * Lotus - Reader Dsl
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Primary export
 */

module.exports = Reader;

function Reader () {
  this.stack = [];
}

/**
 * .handle (bufs, done)
 *
 * @param {Buffers} buffer queue
 * @param {Function} done callback
 * @name handle
 * @api public
 */

Reader.prototype.handle = function (bufs, done) {
  var self = this
    , msg = {};

  function iterate (i) {
    var line = self.stack[i];
    if (!line) return done(null, msg);
    line(msg, bufs, function (err) {
      if (err) return done(err);
      iterate(++i);
    });
  }

  iterate(0);
};

/**
 * .take (length, property[, decode])
 *
 * @param {Number|String} length or length reference
 * @param {String} as property in final message
 * @param {Function} decode (optional)
 * @returns {this} for chaining
 * @name end
 * @api public
 */

Reader.prototype.take = function (len, as, decode) {
  var fn = buildTake(len, as, decode);
  this.stack.push(fn);
  return this;
};

/*!
 * buildTake (len, prop, decode)
 *
 * Wrap the take function for insertion into
 * the reader stack.
 *
 * @param {Number|String} length or length reference
 * @param {String} as property in final message
 * @param {Function} decode (optional)
 * @returns {Function} stackable
 * @api private
 */

function buildTake (len, as, decode) {
  return function (msg, bufs, next) {
    len = 'string' === typeof len
      ? msg[len]
      : len;

    waitFor(len, bufs, function (err, res) {
      if (err) return next(err);
      msg[as] = decode && 'function' === typeof decode
        ? decode(res)
        : res;
      next();
    });
  }
}

/**
 * integer
 *
 * Allows for reading of integers based on signedness
 * and endianness.
 *
 * - u8
 * - u16le
 * - u16be
 * - u32le
 * - u32be
 * - s8
 * - s16le
 * - s16be
 * - s32le
 * - s32be
 *
 * @param {String} property
 * @param {Function} decoder (optional)
 * @returns {this} for chaining
 * @name Integer
 * @api public
 */

Reader.prototype.u8 = function (prop, decode) {
  var fn = buildBytes(1, 'readUInt8', prop, decode);
  this.stack.push(fn);
  return this;
};

Reader.prototype.s8 = function (prop, decode) {
  var fn = buildBytes(1, 'readInt8', prop, decode);
  this.stack.push(fn);
  return this;
};

[ 2, 4 ].forEach(function (bytes) {
  var bits = bytes * 8
    , proto = Reader.prototype

  proto['u' + bits + 'be'] = function (prop, decode) {
    var fn = buildBytes(bytes, 'readUInt' + bits + 'BE', prop, decode);
    this.stack.push(fn);
    return this;
  };

  proto['u' + bits + 'le'] = function () {
    var fn = buildBytes(bytes, 'readUInt' + bits + 'LE', prop, decode);
    this.stack.push(fn);
    return this;
  };

  proto['s' + bits + 'be'] = function () {
    var fn = buildBytes(bytes, 'readInt' + bits + 'BE', prop, decode);
    this.stack.push(fn);
    return this;
  };

  proto['s' + bits + 'le'] = function () {
    var fn = buildBytes(bytes, 'readInt' + bits + 'LE', prop, decode);
    this.stack.push(fn);
    return this;
  };
});

/*!
 * buildBytes (bytes, signed, endian, property, decode)
 *
 * Wrap the integer byte function for insertion
 * into the reader stack.
 *
 * @param {Number} bytes to collection
 * @param {String} signed :: `S` or `U`
 * @param {String} endian :: `BE` or `LE`
 * @param {String} property of message to write
 * @param {Function} decoder (optional)
 * @returns {Function} stackable
 * @api private
 */

function buildBytes (bytes, op, as, decode) {
  return function (msg, bufs, next) {
    waitFor(bytes, bufs, function (err, res) {
      if (err) return next(err);
      var int = res[op](0)
      msg[as] = decode && 'function' === typeof decode
        ? decode(int)
        : int;
      next();
    });
  }
}

/*!
 * waitFor (n, buffers, cb)
 *
 * Wait for the buffers queue to have a length
 * of n, then splice of n bytes from the begining
 * and return in the callback.
 *
 * @param {Number} bytes
 * @param {Buffers} buffer queue
 * @param {Function} callback
 * @cb {Error} or null
 * @cb {Buffer} result
 * @api private
 */

function waitFor (n, bufs, cb) {
  function check () {
    if (bufs.length < n) {
      return bufs.once('push', check);
    } else {
      var res = bufs.splice(0, n).slice();
      cb(null, res);
    }
  }

  check();
}
