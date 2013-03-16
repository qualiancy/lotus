describe('Decoder DSL', function () {
  var Buffers = require('bufs');

  describe('.take()', function () {
    it('can take a numbered length', function (done) {
      var bufs = new Buffers()
        , decoder = new lotus.DecoderDSL();

      decoder.take(3, 'token', function (res) {
        res.should.be.instanceof(Buffer)
          .with.lengthOf(3)
          .and.deep.equal(new Buffer([ 1, 2, 3 ]));
        return '123';
      });

      decoder.handle(bufs, function (err, msg) {
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
        , decoder = new lotus.DecoderDSL();

      decoder.take(0, 'tokenLen', function (res) {
        res.should.be.instanceof(Buffer)
          .with.lengthOf(0);
        return 3;
      });

      decoder.take('tokenLen', 'token', function (res) {
        res.should.be.instanceof(Buffer)
          .with.lengthOf(3)
          .and.deep.equal(new Buffer([ 1, 2, 3 ]));
        return '123';
      });

      decoder.handle(bufs, function (err, msg) {
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
        , decoder = new lotus.DecoderDSL();

      decoder.take(3, 'token', function (res) {
        res.should.be.instanceof(Buffer)
          .with.lengthOf(3)
          .and.deep.equal(new Buffer([ 1, 2, 3 ]));
        return '123';
      });

      decoder.handle(buf, function (err, msg) {
        should.not.exist(err);
        msg.should.deep.equal({ token: '123' });
      });
    });

  });

  describe('byte decoders', function () {
    function add (s) {
      it('.' + s + '()', function () {
        lotus.DecoderDSL.should.respondTo(s);
      });
    }

    add('u8');
    add('s8');

    [ 16, 32 ].forEach(function (bits) {
      add('u' + bits + 'be');
      add('u' + bits + 'le');
      add('s' + bits + 'be');
      add('s' + bits + 'le');
    });
  });
});
