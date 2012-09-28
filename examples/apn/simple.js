/*!
 * Module dependancies
 */

var lotus = require('../../');

/**
 * .reader
 *
 * Simple Apple Push Notifications protocol.
 * See APN documents for the specification.
 *
 * @api public
 */

exports.reader = lotus.reader()
  .uint16be('tokenLen')
  .take('tokenLen', 'deviceToken')
  .uint16be('payloadLen')
  .take('payloadLen', 'payload', function (res) {
    return JSON.parse(res);
  })
  .end();

/**
 * .writer
 *
 * Enhanced Apple Push Notifications protocol.
 * See APN documents for the specifications.
 *
 * @api public
 */

exports.writer = lotus.writer()
  .uint16be(function (msg) {
    return msg.deviceToken.length;
  })
  .push('deviceToken')
  .uint16be(function (msg) {
    msg.payload = JSON.stringify(msg.payload);
    return Buffer.byteLength(msg.payload, 'utf8');
  })
  .write('payload', 'utf8')
  .end();
