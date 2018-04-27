class DeferredPromise {
    constructor() {
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}

var PortCommands;
(function (PortCommands) {
    PortCommands[PortCommands["call"] = 0] = "call";
    PortCommands[PortCommands["fire"] = 1] = "fire";
    PortCommands[PortCommands["resolve"] = 2] = "resolve";
    PortCommands[PortCommands["reject"] = 3] = "reject";
})(PortCommands || (PortCommands = {}));
class PortHandler {
    constructor(port) {
        this.port = port;
        this.nextPid = 0;
        this.deferreds = new Map();
        this.callHandler = null;
        this.port.onmessage = this.handleMessage.bind(this);
    }
    async terminate() {
        this.port.onmessage = undefined;
        this.port.terminate();
        this.port = undefined; // So that the calls throw;
    }
    async call(service, method, args) {
        if (!this.port)
            throw new Error('PortTerminated');
        const deferred = new DeferredPromise();
        const pid = this.nextPid++;
        this.deferreds.set(pid, deferred);
        this.port.postMessage([PortCommands.call, pid, service, method, args]);
        return deferred.promise;
    }
    setCallHandler(handler) {
        if (this.callHandler !== null)
            throw new Error("Call handler already set");
        this.callHandler = handler;
    }
    fire(service, method, args) {
        if (!this.port)
            throw new Error('PortTerminated');
        this.port.postMessage([PortCommands.fire, service, method, args]);
    }
    async handleMessage(ev) {
        switch (ev.data[0]) { // cmd
            case PortCommands.fire:
                try {
                    // We intentionally ignore the result (and even the errors) of the call. This is rarely a good idea,
                    // but it is sometimes useful.
                    //noinspection JSIgnoredPromiseFromCall
                    this.callHandler(ev.data[2], ev.data[3], ev.data[4]);
                }
                catch (ex) {
                    // We ignore errors during calls because we have no way to handle them.
                    // TODO: add an settable error handler/logger
                    // console.error(ex);
                }
                break;
            case PortCommands.call:
                try {
                    const res = await this.callHandler(ev.data[2], ev.data[3], ev.data[4]);
                    this.port.postMessage([PortCommands.resolve, ev.data[1], res]);
                }
                catch (ex) {
                    this.port.postMessage([PortCommands.reject, ev.data[1], ex]);
                }
                break;
            case PortCommands.resolve:
                this.deferreds.get(ev.data[1]).resolve(ev.data[2]);
                this.deferreds.delete(ev.data[1]);
                break;
            case PortCommands.reject:
                this.deferreds.get(ev.data[1]).reject(ev.data[2]);
                this.deferreds.delete(ev.data[1]);
                break;
        }
    }
}

class ServiceMap {
    constructor() {
        this.services = new Map();
        this.ports = [];
    }
    addPort(port) {
        const handler = new PortHandler(port);
        handler.setCallHandler(this.handleCall.bind(this));
        this.ports.push(handler);
        return handler;
    }
    terminatePort(handler) {
        this.ports.splice(this.ports.indexOf(handler), 1);
        handler.terminate();
    }
    addServiceObject(name, obj) {
        return this.services.set(name, obj);
    }
    async handleCall(service, method, args) {
        const serviceObj = this.services.get(service);
        if (serviceObj !== undefined)
            return await serviceObj[method](...args);
        // We don't know about this service at all...
        throw new Error("Service not found");
    }
}

class RemoteService {
    constructor(port) {
        this.port = port;
    }
    async call(method, args = []) {
        return await this.port.call(this.name, method, args);
    }
}

class WorkerServiceManager extends ServiceMap {
    constructor(localServiceMap, remoteServiceMap) {
        super();
        localServiceMap.forEach((obj, name) => this.addServiceObject(name, obj));
        remoteServiceMap.forEach((serviceProxyTypes, port) => {
            const portHandler = this.addPort(port);
            serviceProxyTypes.forEach((serviceProxyInfo) => {
                const proxy = new serviceProxyInfo[1](portHandler);
                proxy.name = serviceProxyInfo[0];
                this.addServiceObject(serviceProxyInfo[0], proxy);
            });
        });
    }
}

export { WorkerServiceManager, RemoteService, PortHandler };
//# sourceMappingURL=bundle.module.js.map
