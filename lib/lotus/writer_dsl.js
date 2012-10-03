/*!
 * Lotus - Writer Dsl
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * External dependancies
 */

var Buffers = require('bufs');

/*!
 * Primary export
 */

module.exports = Writer;

function Writer () {
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

Writer.prototype.handle = function (msg, done) {
  var self = this
    , bufs = new Buffers();

  function iterate (i) {
    var line = self.stack[i];
    if (!line) return done(null, bufs.slice());
    line(msg, bufs, function (err) {
      if (err) return done(err);
      iterate(++i);
    });
  }

  iterate(0);
};

/**
 * .push (buffer)
 *
 * @param {String|Buffer} string prop name or buffer
 * @name push
 * @api public
 */

Writer.prototype.push = function (buf) {
  var fn = buildPush(buf);
  this.stack.push(fn);
  return this;
};

/*!
 * buildPush (buffer)
 *
 * Wrap the push function for instertion
 * into the writer stack.
 *
 * @param {String|Buffer} string prop name or buffer
 * @returns {Function} stackable
 * api private
 */

function buildPush (buf) {
  return function (msg, bufs, next) {
    buf = !(buf instanceof Buffer)
      ? msg[buf]
      : buf;

    if (buf instanceof Buffer) {
      bufs.push(buf);
      return next();
    } else {
      return next(new Error('Result not a buffer.'));
    }
  };
}

/**
 * .write (property[, encoding[, encoder]])
 *
 *    writer.write('token');
 *    writer.write('payload', 'utf8', JSON.stringify);
 *
 * @param {String} property name
 * @param {String} encoding (optional) default: utf8
 * @param {Function} encoding helper function (optional)
 * @name write
 * @api public
 */

Writer.prototype.write = function (prop, enc, encode) {
  var fn = buildWrite(prop, enc, encode);
  this.stack.push(fn);
  return this;
};

/*!
 * buildWriter (property[, encoding[, encoder]])
 *
 * Wrap the write function for instertion
 * into the writer stack.
 *
 * @param {String} property name
 * @param {String} encoding (optional) default: utf8
 * @param {Function} encoding helper function (optional)
 * @returns {Function} stackable
 * api private
 */

function buildWrite (prop, enc, encode) {
  if ('function' === typeof enc) {
    encode = enc;
    enc = 'utf8';
  }

  enc = enc || 'utf8';

  return function (msg, bufs, next) {
    var res = encode && 'function' === typeof encode
        ? encode(msg[prop])
        : msg[prop]
      , len = Buffer.byteLength(res, enc)
      , buf = new Buffer(len);
    buf.write(res, 0, enc);
    bufs.push(buf);
    next(null);
  };
}
