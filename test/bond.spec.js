/**
 * @venus-library mocha
 * @venus-code ../bond.js
 */

describe('bond library', function () {

  var b, promise;

  beforeEach(function () {
    b = bond();
    promise = b.promise;
  });

  it('should be an object', function () {
    expect(b).to.be.an('object');
  });

  describe('then functionality', function () {
    var cb, cba;

    beforeEach(function () {
      cb = sinon.spy();
      cba = sinon.spy();
    });

    it('should call then callback when bond is fulfilld', function () {
      promise.then(cb);
      b.fulfill();
      expect(cb.callCount).to.be(1);
    });

    it('should only fulfill once', function () {
      b.then(cb);
      b.fulfill();
      b.fulfill();
      expect(cb.callCount).to.be(1);
    });

    it('can call then after fulfill', function (done) {
      b.fulfill();
      promise.then(cb);

      setTimeout(function () {
        expect(cb.callCount).to.be(1);
        done();
      }, 10);
    });

    it('can call then after fulfill, with correct args', function (done) {
      b.fulfill(1);
      promise.then(cb);

      setTimeout(function () {
        expect(cb.calledWith(1)).to.be(true);
        done();
      }, 10);
    });

    it('should call then callback with correct args', function () {
      b.then(cb);
      b.fulfill(1);
      expect(cb.calledWith(1)).to.be(true);
    });

    it('should return a new bond', function () {
      var retVal = promise.then(cb);
      expect(retVal.then).to.be.a('function');
    });

    it('should support chaining', function (done) {
      var state, cb, cba;

      state = 1;
      cb = function () {
        var b = bond();

        setTimeout(function () {
          state++;
          b.fulfill();
        }, 10);

        return b;
      };

      cba = function () {
        expect(state).to.be(2);
        done();
      };

      b.then(cb).then(cba);
      b.fulfill();
    });

    it('should support chaining when fulfilld before then is called', function (done) {
      var state, cb, cba;

      state = 1;
      cb = function () {
        var b = bond();

        setTimeout(function () {
          state++;
          b.fulfill();
        }, 50);

        return b;
      };

      cba = function () {
        expect(state).to.be(2);
        done();
      };

      b.fulfill();
      b.then(cb).then(cba);
    });
  });

  describe('reject', function () {
    var task1;

    beforeEach(function () {
      task1 = sinon.spy();
    });

    it('should call reject handler', function () {
      b.then(function () {}, task1);
      b.reject();
      expect(task1.callCount).to.be(1);
    });

  });

  describe('wait for', function () {
    var state;

    beforeEach(function () {
      state = 0;
    });

    it('should wait for all bonds to complete', function (done) {
      var task1, task2, task3, task3Bond;

      task1 = function () {
        var b = bond();

        setTimeout(function () {
          state++;
          b.fulfill();
        }, 50);

        return b;
      };

      task2 = function () {
        var b = bond();

        setTimeout(function () {
          state++;
          b.fulfill();
        }, 80);

        return b;
      };

      task3 = function () {
        var b = bond();

        state++;
        b.fulfill();

        return b;
      };

      task3Bond = task3();

      bond.waitFor(task1(), task2(), task3Bond).then(function () {
        var b = bond();

        setTimeout(function () {
          state++;
          b.fulfill();
        }, 10);

        return b;
      }).then(function () {
        expect(state).to.be(4);
        done();
      });

    });
  });
});
