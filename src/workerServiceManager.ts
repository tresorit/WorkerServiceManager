import { PortHandler } from "./portHandler";
import { RemoteService } from "./remoteService";
import { ServiceMap } from "./serviceMap";
import {MessageTransformer} from "./messageTransformers/messageTransformer";
import {DefaultMessageTransformer} from "./messageTransformers/defaultMessageTransformer";

export class WorkerServiceManager extends ServiceMap {
  constructor(localServiceMap, remoteServiceMap, messageTransformer: MessageTransformer = new DefaultMessageTransformer()) {
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

export { MultiRemoteService } from "./multiRemoteService";
export { RemoteService } from "./remoteService";
export { PortHandler } from "./portHandler";
