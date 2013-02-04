describe('WriterStream', function () {
  it('is an instanceof a stream', function () {
    var out = lotus.createWriterStream();
    out.should.be.instanceof(require('stream'));
  });

  it('can add a function to use stack', function () {
    var out = lotus.createReaderStream()
      , noop = function () {};
    out.should.respondTo('use');
    out.use(0, noop);
    out.use(1, { handle: noop });
    out.should.have.property('stack')
      .an('object');
    out.stack.should.have.property(0)
      .a('function').deep.equal(noop);
    out.stack.should.have.property(1)
      .a('function').deep.equal(noop);
  });

  it('can handle writing of objects to buffer', function (done) {
    var out = lotus.createWriterStream()
      , handle = chai.spy(function (msg, done) {
          msg.should.be.an('object')
            .to.deep.equal({ hello: 'universe' });
          done.should.be.a('function');

          done(null, new Buffer([ 1 ]));
        })
      , listener = chai.spy(function (buf) {
          buf.should.be.an.instanceof(Buffer)
            .and.deep.equal(new Buffer([ 0, 1 ]));
        });

    out.use(0, handle);
    out.on('data', listener);

    out.on('end', function () {
      handle.should.have.been.called.exactly(3);
      listener.should.have.been.called.exactly(3);
      done();
    });

    out.should.respondTo('write');

    out.write(0, { hello: 'universe' });
    out.write(0, { hello: 'universe' });
    out.write(0, { hello: 'universe' });
    out.end();
  });

  it('can handle writing of objects to buffer', function (done) {
    var out = lotus.createWriterStream()
      , handle = chai.spy(function (msg, done) {
          msg.should.be.an('object')
            .to.deep.equal({ hello: 'universe' });
          done.should.be.a('function');

          done(null, new Buffer([ 1 ]));
        })
      , listener = chai.spy(function (buf) {
          buf.should.be.an.instanceof(Buffer)
            .and.deep.equal(new Buffer([ 1 ]));
        });

    out.use(handle);
    out.on('data', listener);

    out.on('end', function () {
      handle.should.have.been.called.exactly(3);
      listener.should.have.been.called.exactly(3);
      done();
    });

    out.should.respondTo('write');

    out.write({ hello: 'universe' });
    out.write({ hello: 'universe' });
    out.write({ hello: 'universe' });
    out.end();
  });
});
