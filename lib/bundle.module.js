function transformError(err) {
    return {
        name: err.name,
        message: err.message,
        stack: err.stack,
    };
}
class DefaultMessageTransformer {
    transform(message, visited) {
        if (message && typeof message === 'object') {
            visited.set(message, false);
            switch (Object.prototype.toString.call(message)) {
                case '[object ArrayBuffer]':
                case '[object Uint8Array]':
                case '[object Int8Array]':
                case '[object Uint16Array]':
                case '[object Int16Array]':
                case '[object Uint32Array]':
                case '[object Int32Array]':
                case '[object Float32Array]':
                case '[object Float64Array]':
                    if (message.buffer.byteLength === message.byteLength) {
                        visited.set(message, false);
                        return [message, [message.buffer], false];
                    }
                    else {
                        const copy = new message.constructor(message);
                        visited.set(message, true);
                        return [copy, [copy.buffer], true];
                    }
                case '[object Array]':
                    const res = message.map(e => this.transform(e, visited));
                    const copied = res.reduce((a, c) => a || c, false);
                    visited.set(message, copied);
                    return [copied ? res.map(a => a[0]) : message, res.reduce((a, c) => a.concat(c[1]), []), copied];
                case '[object Promise]':
                case '[object XMLHttpRequest]':
                case '[object Event]':
                    throw new Error('CommunicationErrorNonMessageableValue');
                case '[object DOMError]':
                case '[object DOMException]':
                    visited.set(message, true);
                    return [transformError(message), [], true];
                default:
                    if (message instanceof Error) {
                        visited.set(message, true);
                        return [transformError(message), [], true];
                    }
                    const resObj = {};
                    let transferrables = [];
                    let copiedObj = false;
                    for (const key of Object.keys(message)) {
                        if (!key.startsWith('_')) {
                            const cRes = this.transform(message[key], visited);
                            transferrables = transferrables.concat(cRes[2]);
                            if (cRes[3]) {
                                copiedObj = true;
                                resObj[key] = copiedObj;
                            }
                            else {
                                resObj[key] = message[key];
                            }
                        }
                    }
                    visited.set(message, copiedObj);
                    return [copiedObj ? resObj : message, transferrables, copiedObj];
            }
        }
        return [message, [], false];
    }
    transformMessage(message) {
        return this.transform(message, new Map()).slice(0, 2);
    }
}

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
class BasicPortHandler {
    constructor(port, messageTransformer) {
        this.port = port;
        this.messageTransformer = messageTransformer;
        this.nextPid = 0;
        this.deferreds = new Map();
        this.callHandler = null;
        if (this.port)
            this.port.onmessage = this.handleMessage.bind(this);
    }
    async terminate() {
        const port = this.port;
        port.onmessage = undefined;
        port.terminate();
        this.port = undefined;
    }
    async call(service, method, args) {
        const deferred = new DeferredPromise();
        const pid = this.nextPid++;
        this.deferreds.set(pid, deferred);
        const msg = this.messageTransformer.transformMessage(args);
        try {
            await this.postMessage([PortCommands.call, pid, service, method, msg[0]], msg[1]);
        }
        catch (ex) {
            deferred.reject(ex);
        }
        return deferred.promise;
    }
    setCallHandler(handler) {
        if (this.callHandler !== null)
            throw new Error("Call handler already set");
        this.callHandler = handler;
    }
    fire(service, method, args) {
        const msg = this.messageTransformer.transformMessage(args);
        return this.postMessage([PortCommands.fire, service, method, msg[0]], msg[1]);
    }
    async postMessage(msg, transferables) {
        if (!this.port)
            throw new Error("PortTerminated");
        this.port.postMessage(msg, transferables);
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
                    const msg = this.messageTransformer.transformMessage(res);
                    await this.postMessage([PortCommands.resolve, ev.data[1], msg[0]], msg[1]);
                }
                catch (ex) {
                    const msg = this.messageTransformer.transformMessage(ex);
                    await this.postMessage([PortCommands.reject, ev.data[1], msg[0]], msg[1]);
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

class AsyncPortHandler extends BasicPortHandler {
    constructor(portPromise, messageTransformer) {
        super(undefined, messageTransformer);
        this.portPromise = portPromise;
    }
    async terminate() {
        await this.ensurePort();
        this.portPromise = undefined;
        return super.terminate();
    }
    async postMessage(msg, transferables) {
        await this.ensurePort();
        return super.postMessage(msg, transferables);
    }
    async ensurePort() {
        if (!this.port && this.portPromise) {
            this.port = await this.portPromise;
            this.port.onmessage = this.handleMessage.bind(this);
        }
    }
}

class LazyPortHandler extends AsyncPortHandler {
    constructor(portFactory, messageTransformer) {
        super(undefined, messageTransformer);
        this.portFactory = portFactory;
    }
    async terminate() {
        await this.ensurePort();
        this.portFactory = undefined;
        return super.terminate();
    }
    async postMessage(msg, transferables) {
        await this.ensurePort();
        return super.postMessage(msg, transferables);
    }
    async ensurePort() {
        if (!this.port && this.portFactory)
            this.portPromise = this.portFactory();
        return super.ensurePort();
    }
}

class ServiceMap {
    constructor(messageTransformer = new DefaultMessageTransformer()) {
        this.messageTransformer = messageTransformer;
        this.services = new Map();
        this.ports = [];
    }
    addPort(port) {
        let handler;
        if (typeof port === "function")
            handler = new LazyPortHandler(port, this.messageTransformer);
        else if (port instanceof Promise)
            handler = new AsyncPortHandler(port, this.messageTransformer);
        else
            handler = new BasicPortHandler(port, this.messageTransformer);
        handler.setCallHandler(this.handleCall.bind(this));
        this.ports.push(handler);
        return handler;
    }
    terminatePort(handler) {
        this.ports.splice(this.ports.indexOf(handler), 1);
        // noinspection JSIgnoredPromiseFromCall
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

class MultiRemoteService {
    constructor(serviceMap, portFactory, proxyType, maxPorts, minPorts = 0, messageTransformer = new DefaultMessageTransformer()) {
        this.serviceMap = serviceMap;
        this.portFactory = portFactory;
        this.proxyType = proxyType;
        this.maxPorts = maxPorts;
        this.minPorts = minPorts;
        this.messageTransformer = messageTransformer;
        this.busyPorts = [];
        this.freePorts = [];
        this.queue = [];
    }
    spinUp() {
        while (this.freePorts.length < this.minPorts)
            this.releasePort(this.getNewPort());
    }
    async getRemote() {
        let portHandler;
        if (this.busyPorts.length >= this.maxPorts) {
            const prom = new DeferredPromise();
            this.queue.push(prom);
            portHandler = await prom.promise;
        }
        else if (this.freePorts.length > 0)
            portHandler = this.freePorts.shift();
        else
            portHandler = this.getNewPort();
        const remote = new this.proxyType(portHandler);
        this.busyPorts.push(remote);
        return remote;
    }
    releaseRemote(remote) {
        const portHandler = remote.detach();
        this.busyPorts.splice(this.busyPorts.indexOf(remote), 1);
        this.releasePort(portHandler);
    }
    releasePort(portHandler) {
        if (this.queue.length > 0) {
            const deferred = this.queue.shift();
            deferred.resolve(portHandler);
        }
        else if (this.freePorts.length < this.minPorts)
            this.freePorts.push(portHandler);
        else // noinspection JSIgnoredPromiseFromCall
            portHandler.terminate();
    }
    getNewPort() {
        const ph = new AsyncPortHandler(this.portFactory(), this.messageTransformer);
        ph.setCallHandler(this.serviceMap.handleCall.bind(this.serviceMap));
        return ph;
    }
}

class RemoteService {
    constructor(port) {
        this.port = port;
    }
    async call(method, args = []) {
        if (this.port === undefined)
            throw new Error("RemoteDetached");
        return await this.port.call(this.name, method, args);
    }
    detach() {
        const port = this.port;
        this.port = undefined;
        return port;
    }
}

class WorkerServiceManager extends ServiceMap {
    constructor(localServiceMap, remoteServiceMap, messageTransformer = new DefaultMessageTransformer()) {
        super(messageTransformer);
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

export { WorkerServiceManager, MultiRemoteService, RemoteService, BasicPortHandler };
//# sourceMappingURL=bundle.module.js.map
