const {RemoteService} = require("../../lib/bundle.umd.js");

module.exports.TestServiceProxy = class TestServiceProxy extends RemoteService {
  constructor(port) {
    super(port);
    this.name = 'TestService';
  }

  testFunction(...args) {
    return this.call("testFunction", args);
  }

  testEcho(...args) {
    return this.call("testEcho", args);
  }

  testAsyncEcho(...args) {
    return this.call("testAsyncEcho", args);
  }

  testErr() {
    return this.call("testErr");
  }
}