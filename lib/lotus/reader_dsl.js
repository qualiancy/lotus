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
 * .end (cb)
 *
 * @param {Function} done callback
 * @name end
 * @api public
 */

Reader.prototype.end = function (fn) {

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

    function process () {
      var res = bufs.splice(0, len).slice();
      if (decode && 'function' === typeof decode) {
        res = decode(res);
      }
      msg[as] = res;
      next();
    }

    function check () {
      if (bufs.length < len) {
        return bufs.once('push', check);
      } else {
        process();
      }
    }

    check();
  }
}
