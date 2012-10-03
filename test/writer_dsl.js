describe('Writer DSL', function () {

  describe('.push()', function () {

    it('can push a buffer', function (done) {
      var writer = lotus.writer();

      writer.push(new Buffer([ 0, 1 ]));

      writer.handle({}, function (err, buf) {
        should.not.exist(err);
        buf.should.be.instanceof(Buffer)
          .and.deep.equal(new Buffer([ 0, 1 ]));
        done();
      });
    });

    it('can push a referenced buffer', function (done) {
      var writer = lotus.writer()
        , msg = {
            token: new Buffer([ 0, 1 ])
          };

      writer.push('token');

      writer.handle(msg, function (err, buf) {
        should.not.exist(err);
        buf.should.be.instanceof(Buffer)
          .and.deep.equal(new Buffer([ 0, 1 ]));
        done();
      });
    });

  });

  describe('.write()', function () {

    it('can write without encoder', function (done) {
      var writer = lotus.writer()
        , msg = {
            token: 'abc'
          }

      writer.write('token');

      writer.handle(msg, function (err, buf) {
        should.not.exist(err);
        buf.should.be.instanceof(Buffer);
        buf.toString().should.equal('abc');
        done();
      });
    });

    it('can write with encoder', function (done) {
      var writer = lotus.writer()
        , msg = {
            token: { hello: 'universe' }
          };

      writer.write('token', function (res) {
        return JSON.stringify(res);
      });

      writer.handle(msg, function (err, buf) {
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

});
