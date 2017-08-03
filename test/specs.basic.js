const sinon = require('sinon');
const expect = require('expect.js');

const { WorkerServiceManager, RemoteService } = require("../lib/bundle.umd.js");

const PortPair = require("./PortPair");

class TestService {
    static testFunction(...args) {
        console.log(args);
    }
}

class TestServiceProxy extends RemoteService {
    testFunction(...args) {
        this.call("testFunction", args);
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

    it("should work", function(){
       testServiceImpl.testFunction = sinon.spy();

       mainHandler.services.get("TestService").testFunction();

       return expect(testServiceImpl.testFunction.calledOnce).to.be.true
    });
});

