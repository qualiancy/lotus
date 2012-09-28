
var Stream = require('stream');

module.exports = ReaderStream;

function ReaderStream () {
  Stream.call(this);
  this.readable = true;
  this.writable = true;
}

util.inherits(ReaderStream, Stream);
