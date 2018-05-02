const sinon = require('sinon');
const expect = require('chai').expect;

const {WorkerServiceManager} = require("../lib/bundle.umd.js");

const {TestService} = require('./res/testService');
const {TestServiceProxy} = require('./res/testServiceProxy');
const PortPair = require("./res/PortPair");

describe("Passing calls", function () {
  let mainHandler, leafHandler;
  let testServiceImpl;
  let portPair;

  beforeEach(function () {
    portPair = new PortPair();
    mainHandler = new WorkerServiceManager(
      new Map([
        ["TestService", new TestService()]
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

  describe('terminate', function () {
    it('should call terminate on the port', () => {
      portPair.port2.terminate = sinon.spy();

      mainHandler.terminatePort(leafHandler.services.get("TestService").port);

      expect(portPair.port2.terminate.callCount).to.equal(1);
    });

    it('should make later calls throw proper errors', async () => {
      portPair.port2.terminate = () => {};

      mainHandler.terminatePort(leafHandler.services.get("TestService").port);

      try {
        await leafHandler.services.get("TestService").testEcho(123);
        expect.fail('Did not throw');
      } catch (e) {
        expect(e.message).to.equal('PortTerminated');
      }
    });
  });
});

