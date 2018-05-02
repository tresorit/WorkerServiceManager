module.exports.TestService = class TestService {
  testFunction(...args) {
    console.log(args);
  }

  testEcho(a) {
    return a;
  }

  testAsyncEcho(a) {
    return Promise.resolve(a);
  }

  testErr() {
    throw new Error("TestError");
  }
};