import {expect} from "chai";
import * as sinon from "sinon";

import {WorkerServiceManager} from "../src/workerServiceManager";

import {PortPair} from "./res/PortPair";
import {TestService} from "./res/testService";
import {TestServiceProxy} from "./res/testServiceProxy";

describe("Passing calls", () => {
  let mainHandler;
  let leafHandler;
  let testServiceImpl;
  let portPair;

  beforeEach(() => {
    portPair = new PortPair();
    mainHandler = new WorkerServiceManager(
      new Map([
        ["TestService", new TestService()],
      ]),
      new Map(),
    );
    mainHandler.addPort(portPair.port1);
    testServiceImpl = mainHandler.services.get("TestService");
    leafHandler = new WorkerServiceManager(
      new Map(),
      new Map([
        [
          portPair.port2, [
          ["TestService", TestServiceProxy],
        ],
        ],
      ]),
    );
  });

  describe("Local calls", () => {
    it("should call the proper function", async () => {
      testServiceImpl.testFunction = sinon.spy();

      await mainHandler.services.get("TestService").testFunction(1);

      return expect(testServiceImpl.testFunction.calledOnce).to.be.true;
    });

    it("should return the proper values", () => {
      const retVal = mainHandler.services.get("TestService").testEcho(123);

      return expect(retVal).to.equal(123);
    });
  });

  describe("Remote calls", () => {
    it("should call the proper function", async () => {
      testServiceImpl.testFunction = sinon.spy();

      await leafHandler.services.get("TestService").testFunction(1);

      return expect(testServiceImpl.testFunction.calledOnce).to.be.true;
    });

    describe("Return values", () => {
      it("should return the proper for primitives", async () => {
        const testVals = [
          1, "1", "str", true,
        ];
        const retVals = await Promise.all(
          testVals.map((val) => leafHandler.services.get("TestService").testEcho(val)),
        );

        return expect(retVals).to.deep.equal(testVals);
      });

      it("should return the primitive in async calls", async () => {
        const testVals = [
          1, "1", "str", true,
        ];
        const retVals = await Promise.all(
          testVals.map((val) => leafHandler.services.get("TestService").testAsyncEcho(val)),
        );

        return expect(retVals).to.deep.equal(testVals);
      });

      it("should work with errors value", async () => {
        const err = new Error();
        const retVal = await leafHandler.services.get("TestService").testEcho(err);

        return expect(retVal).to.deep.equal({
          message: err.message,
          name: err.name,
          stack: err.stack,
        });
      });

      it("should reject with the proper error", async () => {
        try {
          await leafHandler.services.get("TestService").testErr();
        } catch (ex) {
          expect(ex.message).to.equal("TestError");
        }
      });
    });

    it("should be async", () => {
      const retVal = leafHandler.services.get("TestService").testEcho(123);
      return expect(retVal).to.be.an.instanceof(Promise);
    });
  });

  describe("terminate", () => {
    it("should call terminate on the port", () => {
      portPair.port2.terminate = sinon.spy();

      mainHandler.terminatePort(leafHandler.services.get("TestService").port);

      expect(portPair.port2.terminate.callCount).to.equal(1);
    });

    it("should make later calls throw proper errors", async () => {
      portPair.port2.terminate = () => { return; };

      mainHandler.terminatePort(leafHandler.services.get("TestService").port);

      try {
        await leafHandler.services.get("TestService").testEcho(123);
        expect.fail("Did not throw");
      } catch (e) {
        expect(e.message).to.equal("PortTerminated");
      }
    });
  });
});
