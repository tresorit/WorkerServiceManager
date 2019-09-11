import { expect } from "chai";
import * as sinon from "sinon";

import { MultiRemoteService, WorkerServiceManager } from "../src/workerServiceManager";

import { PortPair } from "./res/PortPair";
import { TestService } from "./res/testService";
import { TestServiceProxy } from "./res/testServiceProxy";
import { utils } from "./res/utils";

describe("MultiRemoteService", () => {
  let mainHandler;
  let portFactory;
  let testServices;

  beforeEach(() => {
    testServices = [];
    mainHandler = new WorkerServiceManager(new Map(), new Map());
    portFactory = sinon.stub().callsFake(() => {
      const portPair = new PortPair();
      const leafManager = new WorkerServiceManager(new Map(), new Map());
      const serviceObj = new TestService();
      testServices.push(sinon.mock(serviceObj));
      leafManager.addServiceObject("TestService", serviceObj);
      leafManager.addPort(portPair.port1);
      return portPair.port2;
    });
  });

  describe("getRemote", () => {
    it("should produce a remote object that calls through properly", async () => {
      const multiRemote = new MultiRemoteService<TestServiceProxy>(mainHandler, portFactory, TestServiceProxy, 1);

      const remote = await multiRemote.getRemote();

      testServices[0].expects("testEcho", "asdf");

      await remote.testEcho("asdf");

      testServices[0].verify();

      expect(testServices);
    });

    it("should block if we are at max capacity", async () => {
      const multiRemote = new MultiRemoteService(mainHandler, portFactory, TestServiceProxy, 1);

      const remote = await multiRemote.getRemote();
      let port = (remote as any).port;

      let secondRemote;
      const prom = multiRemote.getRemote().then(rem => (secondRemote = rem));
      await utils.sleep(1);
      const f = expect(secondRemote).to.be.undefined;
      multiRemote.releaseRemote(remote);
      await prom;
      expect(secondRemote).to.be.ok;
      expect(port).to.equal((secondRemote as any).port);

      expect(testServices).to.be.of.length(1);
    });

    it("should create new remote if we are below the max", async () => {
      const multiRemote = new MultiRemoteService(mainHandler, portFactory, TestServiceProxy, 2);

      const remote = await multiRemote.getRemote();
      const secondRemote = await multiRemote.getRemote();

      expect(remote).to.be.ok;
      expect(secondRemote).to.be.ok;
      expect(testServices).to.be.of.length(2);
    });
  });

  describe("releaseRemote", () => {
    it("should call terminate if we are above the free worker limit", async () => {
      const multiRemote = new MultiRemoteService(mainHandler, portFactory, TestServiceProxy, 1);

      const remote = await multiRemote.getRemote();
      const terminateSpy = sinon.spy();
      (remote as any).port.terminate = terminateSpy;
      multiRemote.releaseRemote(remote);
      await utils.sleep(1);
      expect(terminateSpy.callCount).to.equal(1);
    });

    it("should not call terminate if we are below the free worker limit", async () => {
      const multiRemote = new MultiRemoteService(mainHandler, portFactory, TestServiceProxy, 1, 1);

      const remote = await multiRemote.getRemote();
      const terminateSpy = sinon.spy();
      (remote as any).port.terminate = terminateSpy;
      multiRemote.releaseRemote(remote);
      await utils.sleep(1); // Needed because release terminates the worker async
      expect(terminateSpy.callCount).to.equal(0);
    });

    it("should pass existing service if there is somebody waiting for a service", async () => {
      const multiRemote = new MultiRemoteService(mainHandler, portFactory, TestServiceProxy, 1);

      const remote = await multiRemote.getRemote();
      let port = (remote as any).port;

      const prom = multiRemote.getRemote();
      await utils.sleep(1);
      multiRemote.releaseRemote(remote);
      await prom;
      const secondRemote = await prom;

      expect(port).to.equal((secondRemote as any).port);
      expect(testServices).to.be.of.length(1);
    });
  });

  describe("releaseRemote with no reuse", () => {
    it("should call terminate if we are above the free worker limit", async () => {
      const multiRemote = new MultiRemoteService(mainHandler, portFactory, TestServiceProxy, 1);

      const remote = await multiRemote.getRemote();
      const terminateSpy = sinon.spy();
      (remote as any).port.terminate = terminateSpy;
      multiRemote.releaseRemote(remote);
      await utils.sleep(1);
      expect(terminateSpy.callCount).to.equal(1);
    });

    it("should still call terminate if we are below the free worker limit and add a new one", async () => {
      const multiRemote = new MultiRemoteService(
        mainHandler,
        portFactory,
        TestServiceProxy,
        1,
        undefined,
        undefined,
        false
      );

      const remote = await multiRemote.getRemote();
      const terminateSpy = sinon.spy();
      (remote as any).port.terminate = terminateSpy;
      multiRemote.releaseRemote(remote);
      await utils.sleep(1); // Needed because release terminates the worker async
      expect(terminateSpy.callCount).to.equal(1);
    });

    it("should pass new service even if there is somebody waiting for a service", async () => {
      const multiRemote = new MultiRemoteService(
        mainHandler,
        portFactory,
        TestServiceProxy,
        1,
        undefined,
        undefined,
        false
      );

      const remote = await multiRemote.getRemote();
      let port = (remote as any).port;
      const terminateSpy = sinon.spy();
      (remote as any).port.terminate = terminateSpy;

      const prom = multiRemote.getRemote();
      await utils.sleep(1);
      multiRemote.releaseRemote(remote);
      await prom;
      const secondRemote = await prom;

      expect(terminateSpy.callCount).to.equal(1);
      expect(remote).to.not.equal(secondRemote);
      expect(port).to.not.equal((secondRemote as any).port);
      expect(testServices).to.have.length(2);
    });
  });
});
