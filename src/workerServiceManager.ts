import { ServiceMap } from "./serviceMap";

export class WorkerServiceManager extends ServiceMap {
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

export { RemoteService } from "./remoteService";
export { PortHandler } from "./portHandler";
