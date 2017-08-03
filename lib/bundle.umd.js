(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.WorkerServiceManager = {})));
}(this, (function (exports) { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */













function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var PortCommands;
(function (PortCommands) {
    PortCommands[PortCommands["call"] = 0] = "call";
    PortCommands[PortCommands["fire"] = 1] = "fire";
    PortCommands[PortCommands["resolve"] = 2] = "resolve";
    PortCommands[PortCommands["reject"] = 3] = "reject";
})(PortCommands || (PortCommands = {}));
class DeferredPromise {
    constructor() {
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
class PortHandler {
    constructor(port) {
        this.port = port;
        this.nextPid = 0;
        this.deferreds = new Map();
        this.callHandler = null;
        this.port.onmessage = this.handleMessage.bind(this);
    }
    call(service, method, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const deferred = new DeferredPromise();
            const pid = this.nextPid++;
            this.deferreds.set(pid, deferred);
            this.port.postMessage([PortCommands.call, pid, service, method, args]);
            return deferred.promise;
        });
    }
    setCallHandler(handler) {
        if (this.callHandler !== null)
            throw new Error("Call handler already set");
        this.callHandler = handler;
    }
    fire(service, method, args) {
        this.port.postMessage([PortCommands.fire, service, method, args]);
    }
    handleMessage(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (ev.data[0]) {
                case PortCommands.fire:
                    try {
                        // We intentionally ignore the result (and even the errors) of the call. This is rarely a good idea,
                        // but it is sometimes useful.
                        //noinspection JSIgnoredPromiseFromCall
                        this.callHandler(ev.data[2], ev.data[3], ev.data[4]);
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                    break;
                case PortCommands.call:
                    try {
                        const res = yield this.callHandler(ev.data[2], ev.data[3], ev.data[4]);
                        this.port.postMessage([PortCommands.resolve, ev.data[1], res]);
                    }
                    catch (ex) {
                        this.port.postMessage([PortCommands.reject, ev.data[1], ex]);
                    }
                    break;
                case PortCommands.resolve:
                    this.deferreds.get(ev.data[1]).resolve(ev.data[2]);
                    break;
                case PortCommands.reject:
                    this.deferreds.get(ev.data[1]).reject(ev.data[2]);
                    break;
            }
        });
    }
}

class ServiceMap {
    constructor() {
        this.services = new Map();
    }
    addPort(port) {
        const handler = new PortHandler(port);
        handler.setCallHandler(this.handleCall.bind(this));
        return handler;
    }
    addServiceObject(name, obj) {
        return this.services.set(name, obj);
    }
    handleCall(service, method, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceObj = this.services.get(service);
            if (serviceObj !== undefined)
                return yield serviceObj[method](...args);
            // We don't know about this service at all...
            throw new Error("Service not found");
        });
    }
}

class RemoteService {
    constructor(port) {
        this.port = port;
    }
    call(method, args = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.port.call(this.name, method, args);
        });
    }
}

class WorkerServiceManager extends ServiceMap {
    constructor(localServiceMap, remoteServiceMap) {
        super();
        localServiceMap.forEach((obj, name) => this.addServiceObject(name, obj));
        remoteServiceMap.forEach((serviceProxyTypes, port) => {
            const portHandler = this.addPort(port);
            serviceProxyTypes.forEach(serviceProxyInfo => {
                console.log('asdf', serviceProxyInfo);
                const proxy = new serviceProxyInfo[1](portHandler);
                this.addServiceObject(serviceProxyInfo[0], proxy);
            });
        });
    }
}

exports.WorkerServiceManager = WorkerServiceManager;
exports.RemoteService = RemoteService;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bundle.umd.js.map
