var bond = require('../bond.js');

module.exports.pending = function () {
  var b, fulfill, reject;

  b = bond();

  fulfill = function (value) {
    b.fulfill(value);
  };

  reject = function (value) {
    b.reject(value);
  };

  return {
    promise: b,
    fulfill: fulfill,
    reject: reject
  };
};

module.exports.fulfilled = function (value) {
  var b = bond();

  b.state = b.FULFILLED;
  b.value = value;
  return b;
};

module.exports.rejected = function (reason) {
  var b = bond();

  b.state = b.REJECTED;
  b.reason = reason;
  return b;
};
