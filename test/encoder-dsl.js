describe('Encoder DSL', function () {
  describe('.push()', function () {
    it('can push a buffer', function (done) {
      var encode = new lotus.EncoderDSL();
      encode.push(new Buffer([ 0, 1 ]));
      encode.handle({}, function (err, buf) {
        should.not.exist(err);
        buf.should.be.instanceof(Buffer)
          .and.deep.equal(new Buffer([ 0, 1 ]));
        done();
      });
    });

    it('can push a referenced buffer', function (done) {
      var encode = new lotus.EncoderDSL()
        , msg = { token: new Buffer([ 0, 1 ]) };
      encode.push('token');
      encode.handle(msg, function (err, buf) {
        should.not.exist(err);
        buf.should.be.instanceof(Buffer)
          .and.deep.equal(new Buffer([ 0, 1 ]));
        done();
      });
    });
  });

  describe('.write()', function () {
    it('can write without encoder', function (done) {
      var encode = new lotus.EncoderDSL()
        , msg = { token: 'abc' }
      encode.write('token');
      encode.handle(msg, function (err, buf) {
        should.not.exist(err);
        buf.should.be.instanceof(Buffer);
        buf.toString().should.equal('abc');
        done();
      });
    });

    it('can write with encoder', function (done) {
      var encode = new lotus.EncoderDSL()
        , msg = { token: { hello: 'universe' } };
      encode.write('token', JSON.stringify);
      encode.handle(msg, function (err, buf) {
        should.not.exist(err);
        buf.should.be.instanceof(Buffer);
        var str = buf.toString();

        (function () {
          str = JSON.parse(str);
        }).should.not.throw();

        str.should.deep.equal({ hello: 'universe' });
        done();
      });
    });
  });

  describe('byte encoders', function () {
    function add (s) {
      it('.' + s + '()', function () {
        lotus.EncoderDSL.should.respondTo(s);
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
