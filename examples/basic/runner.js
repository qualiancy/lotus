/*!
 * Module dependancies
 */

var lotus = require('../../');

/*!
 * Import protocols
 */

var dsl = require('./dsl')

/*!
 * Example streams
 */

var incoming = lotus.createReaderStream()
  , outgoing = lotus.createWriterStream();

/*!
 * Setup protocols for incoming stream
 */

incoming.use(0, dsl.reader);

/*!
 * Setup protocols for outgoing stream
 */

outgoing.use(0, dsl.writer);

/*!
 * Simple piping demo
 */

outgoing.pipe(incoming);

/*!
 * Log it
 */

incoming.on('data', function (msg) {
  console.log(msg);
});

/*!
 * Actually write data
 */

var data = require('./data');

process.nextTick(function () {
  data.forEach(function (em) {
    outgoing.write(0, { payload: em });
  });
});
