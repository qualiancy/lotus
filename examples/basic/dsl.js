/*!
 * Module dependancies
 */

var lotus = require('../../');

/**
 * .reader
 *
 * @api public
 */

exports.reader = lotus.reader()
  .u16be('payloadLen')
  .take('payloadLen', 'payload', 'utf8', JSON.parse);

/**
 * .writer
 *
 * @api public
 */

exports.writer = lotus.writer()
  .u16be(function (msg) {
    var payload = JSON.stringify(msg.payload);
    return Buffer.byteLength(payload, 'utf8');
  })
  .write('payload', 'utf8', JSON.stringify);
