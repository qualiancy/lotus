describe('Decoder Interface', function () {
  chai.Assertion.showDiff = false;
  var noop = function () {};

  describe('.stream() [single stream]', function () {
    it('should set readable interface', function () {
      var decoder = new lotus.Decoder()
        , stream = decoder.stream(noop);
      stream.should.have.property('id', -1);
    });

    it('should get already existing readable interface', function () {
      var decoder = new lotus.Decoder()
        , stream = decoder.stream(noop)
        , streamValidate = decoder.stream();
      streamValidate.should.deep.equal(stream);
    });

    it('should error if try to confert to multiple dsl', function () {
      var decoder = new lotus.Decoder()
        , stream = decoder.stream(noop);
      (function () {
        decoder.stream(0, noop);
      }).should.throw('Cannot convert Decoder to use multiple DSLs.');
    });

    it('can handle reading of objects from buffer', function (done) {
      var decoder = new lotus.createDecoder()
        , handle, readable, stream;

      handle = chai.spy('handle', function (bufs, next) {
        var buf = bufs.splice(0, 1).slice();
        buf.should.deep.equal(new Buffer([ 1 ]));
        next(null, { hello: 'universe' });
      });

      stream = decoder.stream(handle);

      readable = chai.spy('readable', function () {
        var obj = stream.read();
        obj.should.deep.equal({ hello: 'universe' });
      });

      stream.on('readable', readable);

      decoder.on('close', function () {
        handle.should.have.been.called(3);
        readable.should.have.been.called(3);
        done();
      });

      decoder.write(new Buffer([ 1 ]));
      decoder.write(new Buffer([ 1 ]));
      decoder.write(new Buffer([ 1 ]));
      decoder.end();
    });
  });

  describe('.stream() [multiple streams]', function () {
    it('should set multiple readable interfaces', function () {
      var decoder = new lotus.Decoder()
        , stream1 = decoder.stream(1, noop)
        , stream2 = decoder.stream(2, noop);
      stream1.should.have.property('id', 1);
      stream2.should.have.property('id', 2);
    });

    it('should get already existing readable interfaces', function () {
      var decoder = new lotus.Decoder()
        , stream1 = decoder.stream(1, noop)
        , stream2 = decoder.stream(2, noop)
        , stream1Validate = decoder.stream(1)
        , stream2Validate = decoder.stream(2);

      stream1Validate.should.deep.equal(stream1);
      stream2Validate.should.deep.equal(stream2);
    });

    it('should return null on get non-existent', function () {
      var decoder = new lotus.Decoder()
        , stream = decoder.stream(1);
      should.equal(stream, null);
    });

    it('should error if try to convert to single dsl', function () {
      var decoder = new lotus.Decoder()
        , stream = decoder.stream(1, noop);
      (function () {
        decoder.stream(noop);
      }).should.throw('Cannot convert Decoder to use single DSL.');
    });

    it('should handle read of objects from buffer', function (done) {
      var decoder = new lotus.Decoder()
        , objs = []
        , handle1, handle2
        , readable1, readable2, stream1, stream2;

      handle1 = chai.spy('handle1', function (bufs, next) {
        function check () {
          var buf = bufs.splice(0, 1).slice();
          buf.should.deep.equal(new Buffer([ 8 ]));
          next(null, { hello: 'world'});
        }

        if (bufs.length < 1) {
          bufs.once('push', check);
        } else {
          check();
        }
      });

      handle2 = chai.spy('handle2', function (bufs, next) {
        function check () {
          var buf = bufs.splice(0, 1).slice();
          buf.should.deep.equal(new Buffer([ 9 ]));
          next(null, { hello: 'universe'});
        }

        if (bufs.length < 1) {
          bufs.once('push', check);
        } else {
          check();
        }
      });

      stream1 = decoder.stream(0, handle1);
      stream2 = decoder.stream(1, handle2);

      readable1 = chai.spy('readable1', function () {
        var obj = stream1.read();
        obj.should.deep.equal({ hello: 'world' });
      });

      readable2 = chai.spy('readable2', function () {
        var obj = stream2.read();
        obj.should.deep.equal({ hello: 'universe' });
      });

      var endspy = chai.spy('end');

      stream1.on('readable', readable1);
      stream2.on('readable', readable2);
      stream1.on('end', endspy);
      stream2.on('end', endspy);

      decoder.on('close', function () {
        handle1.should.have.been.called(3);
        handle2.should.have.been.called(3);
        readable1.should.have.been.called(3);
        readable2.should.have.been.called(3);
        endspy.should.have.been.called.twice;
        done();
      });

      decoder.write(new Buffer([ 0, 8, 1 ]));
      decoder.write(new Buffer([ 9 ]));
      decoder.write(new Buffer([ 0, 8 ]));
      decoder.write(new Buffer([ 0, 8, 1]));

      setTimeout(function () {
        decoder.write(new Buffer([ 9 ]));
      }, 5);

      setTimeout(function () {
        decoder.write(new Buffer([ 1, 9 ]));
        decoder.end();
      }, 10);
    });
  });
});
