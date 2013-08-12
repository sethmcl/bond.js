(function (w) {

  // If module is defined, we assume this is being used
  // as a node.js module
  if (typeof module !== 'undefined') {
    module.exports = createBond;
  } else {
    window.bond = createBond;
  }

  /**
   * Create a new bond
   * @returns {Bond}
   */
  function createBond() {
    return new Bond();
  }

  /**
   * Helper: wait for all promises to be fulfilled
   * @param {Bond} arguments - arbitrary number of promises
   */
  createBond.waitFor = function () {
    var args = Array.prototype.slice.call(arguments, 0),
        fulfillCount = 0,
        b = new Bond();

    args.forEach(function (bond) {
      bond.then(function () {
        fulfillCount++;

        if (fulfillCount === args.length) {
          b.fulfill();
        }
      }, function (error) {
        b.reject(error);         
      });
    });

    return b;
  };

  /**
   * Bond constructor
   * @constructor
   */
  function Bond() {
    this.thens = [];
    this.PENDING = 0;
    this.FULFILLED = 1;
    this.REJECTED = 2;
    this.state = this.PENDING;

  }

  // Define Bond properties
  Object.defineProperties(Bond.prototype, {
    isFulfilled: {
      get: function () {
        return this.state === this.FULFILLED;
      }
    },
    isRejected: {
      get: function () {
        return this.state === this.REJECTED;
      }
    },
    isPending: {
      get: function () {
        return this.state === this.PENDING;
      }
    },
    promise: {
      get: function () {
        return {
          then: this.then.bind(this)
        }
      }
    }
  });

  /**
   * Promises/A+ compatible then() method
   * @param {Function} onFulfilled - function to call when promise is fulfilled
   * @param {Function} onRejected - function to call when promise is rejected
   * @returns {Object} a new promise
   */
  Bond.prototype.then = function (onFulfilled, onRejected) {
    var bond = new Bond(),
        then = {onFulfilled: onFulfilled, onRejected: onRejected, bond: bond};

      if (this.isFulfilled) {
        setTimeout(function () {
          doFulfill.call(this, then);
        }.bind(this), 0);
      } else if (this.isRejected) {
        setTimeout(function () {
          doReject.call(this, then);
        }.bind(this), 0);
      }

      this.thens.push(then);

    return bond.promise;
  };

  /**
   * Fulfill this bond
   * @param {Object} value the value to fulfill with
   */
  Bond.prototype.fulfill = function (value) {
    this.value = value;

    if (!this.isPending) {
      return;
    }

    this.state = this.FULFILLED;

    this.thens.forEach(function (then) {
      doFulfill.call(this, then);
    }, this);
  };

  /**
   * Reject this bond
   * @param {Object} reason the reason for rejection
   */
  Bond.prototype.reject = function (reason) {
    this.reason = reason;

    if (!this.isPending) {
      return;
    }

    this.state = this.REJECTED;

    this.thens.forEach(function (then) {
      doReject.call(this, then);
    }, this);

  };

  /**
   * Fulfill the promise
   * @param {Object} tehn contains handlers and bond
   */
  function doFulfill(then) {
    var retVal, onFulfilled, bond;

    onFulfilled = then.onFulfilled;
    bond = then.bond;

    try {
      if (typeof onFulfilled === 'function') {
        retVal = onFulfilled(this.value);
      } else {
        bond.fulfill(this.value);
      }

      if (retVal && typeof retVal.then === 'function') {
        retVal.then(function (value) {
          bond.fulfill(value);
        }, function (reason) {
          bond.reject(reason);
        });
      } else {
        bond.fulfill(retVal);
      }
    } catch (e) {
      bond.reject(e);
    }
  }

  /**
   * Reject the promise
   * @param {Object} then contains handlers and bond
   */
  function doReject(then) {
    var retVal, onRejected, bond;

    onRejected = then.onRejected;
    bond = then.bond;

    try {
      if (typeof onRejected === 'function') {
        retVal = onRejected(this.reason);
      } else {
        bond.reject(this.reason);
      }

      if (retVal && typeof retVal.then === 'function') {
        retVal.then(function (value) {
          bond.fulfill(value);
        }, function (reason) {
          bond.reject(reason);
        });
      } else {
        bond.fulfill(retVal);
      }
    } catch(e) {
      bond.reject(e);
    }
  }


}(typeof module !== 'undefined' ? module.exports : window));
