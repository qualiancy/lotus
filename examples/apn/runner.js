/*!
 * Module dependancies
 */

var EventEmitter = require('events').EventEmitter
  , lotus = require('../../');

/*!
 * Import protocols
 */

var simple = require('./simple')
  , enhanced = require('./enhanced');

/*!
 * Example streams
 */

var ee = new EventEmitter()
  , incoming = new lotus.readerStream()
  , outgoing = new lotus.writerStream()

/*!
 * EventEmitter example
 */

ee.on('data', function (msg) {
  console.log(msg);
});

/*!
 * Setup protocols for incoming stream
 */

incoming.use(0, simple.reader);
incoming.use(1, enhanced.reader);

/*!
 * Setup protocols for outgoing stream
 */

outgoing.use(0, simple.writer);
outgoing.use(1, enhanced.writer);

/*!
 * Simple piping demo
 */

outgoing.pipe(incoming).pipe(ee);

/*!
 * Actually write data
 */

var data = require('./data');

process.nextTick(function () {
  data.forEach(function (em) {
    outgoing.write(0, em);
    outgoing.write(1, em);
  });
});
