const sinon = require('sinon');
const expect = require('chai').expect;

const {WorkerServiceManager, RemoteService} = require("../lib/bundle.umd.js");

const PortPair = require("./PortPair");

class TestService {
  static testFunction(...args) {
    console.log(args);
  }

  static testEcho(a) {
    return a;
  }

  static testAsyncEcho(a) {
    return Promise.resolve(a);
  }

  static testErr() {
    throw new Error("TestError");
  }
}

class TestServiceProxy extends RemoteService {
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

describe("Passing calls", function () {
  let mainHandler, leafHandler;
  let testServiceImpl;

  beforeEach(function () {
    const portPair = new PortPair();
    mainHandler = new WorkerServiceManager(
      new Map([
        ["TestService", TestService]
      ]),
      new Map()
    );
    mainHandler.addPort(portPair.port1);
    testServiceImpl = mainHandler.services.get("TestService");
    leafHandler = new WorkerServiceManager(
      new Map(),
      new Map([
        [
          portPair.port2, [
          ["TestService", TestServiceProxy]
        ]
        ]
      ])
    );
  });

  describe("Local calls", function () {
    it("should call the proper function", async function () {
      testServiceImpl.testFunction = sinon.spy();

      await mainHandler.services.get("TestService").testFunction(1);

      return expect(testServiceImpl.testFunction.calledOnce).to.be.true;
    });

    it("should return the proper values", function () {
      const retVal = mainHandler.services.get("TestService").testEcho(123);

      return expect(retVal).to.equal(123);
    });
  });

  describe("Remote calls", function () {
    it("should call the proper function", async function () {
      testServiceImpl.testFunction = sinon.spy();

      await leafHandler.services.get("TestService").testFunction(1);

      return expect(testServiceImpl.testFunction.calledOnce).to.be.true;
    });

    describe("Return values", function () {
      it("should return the proper for primitives", async function () {
        const testVals = [
          1, "1", "str", true
        ];
        const retVals = await Promise.all(
          testVals.map(val => leafHandler.services.get("TestService").testEcho(val))
        );

        return expect(retVals).to.deep.equal(testVals);
      });

      it("should return the primitive in async calls", async function() {
        const testVals = [
          1, "1", "str", true
        ];
        const retVals = await Promise.all(
          testVals.map(val => leafHandler.services.get("TestService").testAsyncEcho(val))
        );

        return expect(retVals).to.deep.equal(testVals);
      });

      it("should work with errors value", async function () {
        const err = new Error();
        const retVal = await leafHandler.services.get("TestService").testEcho(err);

        return expect(retVal).to.deep.equal(err);
      });

      it("should reject with the proper error", async function () {
        try {
          await leafHandler.services.get("TestService").testErr();
        } catch (ex) {
          expect(ex.message).to.equal("TestError");
        }
      });
    });

    it("should be async", function () {
      const retVal = leafHandler.services.get("TestService").testEcho(123);
      return expect(retVal).to.be.an.instanceof(Promise);
    })
  });
});

