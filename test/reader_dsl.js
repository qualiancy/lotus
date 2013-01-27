describe('Reader DSL', function () {
  var Buffers = require('bufs');

  describe('.take()', function () {

    it('can take a numbered length', function (done) {
      var bufs = new Buffers()
        , reader = lotus.reader();

      reader.take(3, 'token', function (res) {
        res.should.be.instanceof(Buffer)
          .with.lengthOf(3)
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

    it('can take a referenced length', function (done) {
      var bufs = new Buffers()
        , reader = lotus.reader();

      reader.take(0, 'tokenLen', function (res) {
        res.should.be.instanceof(Buffer)
          .with.lengthOf(0);
        return 3;
      });

      reader.take('tokenLen', 'token', function (res) {
        res.should.be.instanceof(Buffer)
          .with.lengthOf(3)
          .and.deep.equal(new Buffer([ 1, 2, 3 ]));
        return '123';
      });

      reader.handle(bufs, function (err, msg) {
        should.not.exist(err);
        msg.should.deep.equal({
            tokenLen: 3
          , token: '123'
        });
        done();
      });

      setTimeout(function () {
        bufs.push(new Buffer([ 1 ]));
        bufs.push(new Buffer([ 2 ]));
        bufs.push(new Buffer([ 3 ]));
      }, 10);
    });

    it('can take from a normal buffer', function () {
      var buf = new Buffer([ 1, 2, 3 ])
        , reader = lotus.reader();

      reader.take(3, 'token', function (res) {
        res.should.be.instanceof(Buffer)
          .with.lengthOf(3)
          .and.deep.equal(new Buffer([ 1, 2, 3 ]));
        return '123';
      });

      reader.handle(buf, function (err, msg) {
        should.not.exist(err);
        msg.should.deep.equal({ token: '123' });
      });
    });

  });

  describe('byte readers', function () {

    it('has all byte readers', function () {
      lotus.Reader.should.respondTo('u8');
      lotus.Reader.should.respondTo('s8');
      [ 16, 32 ].forEach(function (bits) {
        lotus.Reader.should.respondTo('u' + bits + 'be');
        lotus.Reader.should.respondTo('u' + bits + 'le');
        lotus.Reader.should.respondTo('s' + bits + 'be');
        lotus.Reader.should.respondTo('s' + bits + 'le');
      });
    });

  });

});
