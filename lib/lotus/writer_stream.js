
var Stream = require('stream');

module.exports = WriterStream;

function WriterStream () {
  Stream.call(this);
  this.readable = true;
  this.writable = true;
}

util.inherits(WriterStream, Stream);

