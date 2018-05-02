exports.sleep = function (delay) {
  return new Promise(res => setTimeout(res, delay));
};