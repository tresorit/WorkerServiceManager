import {RemoteService} from "../../src/remoteService";

export class TestServiceProxy extends RemoteService {
  constructor(port) {
    super(port);
    this.name = "TestService";
  }

  public testFunction(...args) {
    return this.call("testFunction", args);
  }

  public testEcho(...args) {
    return this.call("testEcho", args);
  }

  public testAsyncEcho(...args) {
    return this.call("testAsyncEcho", args);
  }

  public testErr() {
    return this.call("testErr");
  }
}
