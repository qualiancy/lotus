describe.only('Encoder', function () {
  var noop = function () {};

  describe('.stream() [single stream]', function () {
    it('should set writable interface', function () {
      var encoder = lotus.createEncoder()
        , stream = encoder.stream(noop);
      stream.should.have.property('headerid', -1);
      stream.writable.should.be.true;
    });

    it('should get an already existing writable interface', function () {
      var encoder = lotus.createEncoder()
        , stream = encoder.stream(noop)
        , streamValidate = encoder.stream();
      streamValidate.should.deep.equal(stream);
    });

    it('should return null on get non-existent', function () {
      var encoder = lotus.createEncoder()
        , stream = encoder.stream();
      should.equal(stream, null);
    });

    it('should error if try to convert to multiple dsl', function () {
      var encoder = lotus.createEncoder()
        , stream = encoder.stream(noop);
      (function () {
        encoder.stream(0, noop);
      }).should.throw('Cannot convert Encoder to use multiple DSLs.');
    });

    it('can handle writing of objects to buffer', function (done) {
      var encoder = lotus.createEncoder()
        , tmp = []
        , handle, readable, stream;

      readable = chai.spy('readable', function () {
        var buf = encoder.read();
        tmp.push(buf);
      });

      handle = chai.spy('handle', function (msg, next) {
        next.should.be.a('function');
        msg.should.be.an('object')
          .that.deep.equals({ hello: 'universe' });
        next(null, new Buffer([ 1 ]));
      });

      encoder.on('readable', readable);
      stream = encoder.stream(handle);

      encoder.on('end', function () {
        handle.should.have.been.called(3);
        readable.should.have.been.called();

        var res = Buffer.concat(tmp);
        res.should.deep.equal(new Buffer([ 1, 1, 1 ]));
        done();
      });

      stream.write({ hello: 'universe' });
      stream.write({ hello: 'universe' });
      stream.write({ hello: 'universe' });
      stream.end();
    });
  });

  describe('.stream() [multiple streams]', function () {
    it('should set multiple writable interfaces', function () {
      var encoder = lotus.createEncoder()
        , stream1 = encoder.stream(1, noop)
        , stream2 = encoder.stream(2, noop);
      stream1.should.have.property('headerid', 1);
      stream1.writable.should.be.true;
      stream2.should.have.property('headerid', 2);
      stream2.writable.should.be.true;
    });

    it('should get already existing writable interfaces', function () {
      var encoder = lotus.createEncoder()
        , stream1 = encoder.stream(1, noop)
        , stream2 = encoder.stream(2, noop)
        , stream1Validate = encoder.stream(1)
        , stream2Validate = encoder.stream(2);

      stream1Validate.should.deep.equal(stream1);
      stream2Validate.should.deep.equal(stream2);
    });

    it('should return null on get non-existent', function () {
      var encoder = lotus.createEncoder()
        , stream = encoder.stream(1);
      should.equal(stream, null);
    });

    it('should error if try to convert to single dsl', function () {
      var encoder = lotus.createEncoder()
        , stream = encoder.stream(1, noop);
      (function () {
        encoder.stream(noop);
      }).should.throw('Cannot convert Encoder to use single DSL.');
    });

    it('can handle writing of objects to buffer', function (done) {
      var encoder = lotus.createEncoder()
        , tmp = []
        , handle1, handle2
        , readable, stream1, stream2;

      readable = chai.spy('readable', function () {
        var buf = encoder.read();
        tmp.push(buf);
      });

      handle1 = chai.spy('handle', function (msg, next) {
        next.should.be.a('function');
        msg.should.be.an('object')
          .that.deep.equals({ hello: 'world' });
        next(null, new Buffer([ 8 ]));
      });

      handle2 = chai.spy('handle', function (msg, next) {
        next.should.be.a('function');
        msg.should.be.an('object')
          .that.deep.equals({ hello: 'universe' });
        next(null, new Buffer([ 9 ]));
      });

      encoder.on('readable', readable);
      stream1 = encoder.stream(0, handle1);
      stream2 = encoder.stream(1, handle2);

      encoder.on('end', function () {
        handle1.should.have.been.called(3);
        handle2.should.have.been.called(3);
        readable.should.have.been.called();

        var res = Buffer.concat(tmp);
        res.should.deep.equal(new Buffer([0,8, 1,9, 0,8, 0,8, 1,9, 1,9 ]));
        done();
      });

      stream1.write({ hello: 'world' });
      stream2.write({ hello: 'universe' });
      stream1.write({ hello: 'world' });
      stream1.write({ hello: 'world' });
      stream1.end();

      stream2.write({ hello: 'universe' });
      stream2.write({ hello: 'universe' });
      stream2.end();
    });
  });
});
