
describe('ReaderStream', function () {
  var Buffers = require('bufs');

  it('is an instanceof a stream', function () {
    var inc = lotus.createReaderStream();
    inc.should.be.instanceof(require('stream'));
  });

  it('can add a function to use stack', function () {
    var inc = lotus.createReaderStream()
      , noop = function () {};
    inc.should.respondTo('use');
    inc.use(0, noop);
    inc.use(1, { handle: noop });
    inc.should.have.property('stack')
      .an('object');
    inc.stack.should.have.property(0)
      .a('function').deep.equal(noop);
    inc.stack.should.have.property(1)
      .a('function').deep.equal(noop);
  });

  it('can handle writing of buffers to queue', function (done) {
    var inc = lotus.createReaderStream()
      , handle = chai.spy(function (queue, done) {
          queue.should.be.instanceof(Buffers);
          done.should.be.a('function');

          function process () {
            var buf = queue.splice(0, 1).slice()
            buf.should.deep.equal(new Buffer([ 1 ]));
            done(null, { hello: 'world' });
          }

          function check () {
            if (queue.length === 0) {
              queue.once('push', check);
            } else {
              process();
            }
          }

          check();
        })
      , listener = chai.spy(function (msg) {
          msg.should.deep.equal({ hello: 'world' });
        });

    inc.use(0, handle);
    inc.on('data', listener);

    inc.on('end', function () {
      handle.should.have.been.called.exactly(3);
      listener.should.have.been.called.exactly(3);
      done();
    });

    inc.should.respondTo('write');

    inc.write(new Buffer([ 0 ]));
    inc.write(new Buffer([ 1 ]));
    inc.write(new Buffer([ 0 ]));
    inc.write(new Buffer([ 1 ]));
    inc.write(new Buffer([ 0 ]));
    inc.write(new Buffer([ 1 ]));
    inc.end();

  });

});
