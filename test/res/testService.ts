export class TestService {
  public testFunction(...args) {
    console.log(args);
  }

  public testEcho(a) {
    return a;
  }

  public testAsyncEcho(a) {
    return Promise.resolve(a);
  }

  public testErr() {
    throw new Error("TestError");
  }
}
