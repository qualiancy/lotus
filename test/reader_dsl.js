
describe('Reader DSL', function () {
  var Buffers = require('bufs');

  it('can take from the buffer', function (done) {
    var bufs = new Buffers()
      , reader = lotus.reader();

    reader.take(3, 'token', function (res) {
      res.should.be.instanceof(Buffer)
        .with.length(3)
        .and.deep.equal(new Buffer([ 1, 2, 3 ]));
      return '123';
    });

    reader.handle(bufs, function (err, msg) {
      should.not.exist(err);
      msg.should.deep.equal({ token: '123' });
      done();
    });

    setTimeout(function () {
      bufs.push(new Buffer([ 1 ]));
      bufs.push(new Buffer([ 2 ]));
      bufs.push(new Buffer([ 3 ]));
    }, 10);
  });

});
