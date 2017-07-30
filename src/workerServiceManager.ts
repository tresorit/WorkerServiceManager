import {ServiceMap} from "./serviceMap";

export class WorkerServiceManager extends ServiceMap {
    constructor(localServiceMap, remoteServiceMap) {
        super();

        localServiceMap.forEach((obj, name) =>
            this.addServiceObject(name, obj)
        );

        remoteServiceMap.forEach((serviceProxyTypes, port) => {
            const portHandler = this.addPort(port);

            serviceProxyTypes.forEach(serviceProxyType => {
                const proxy = new serviceProxyType(portHandler);
                this.addServiceObject(proxy.name, proxy);
            });
        });
    }
}

export {RemoteService} from "./remoteService";