import {DefaultMessageTransformer} from "./messageTransformers/defaultMessageTransformer";
import {MessageTransformer} from "./messageTransformers/messageTransformer";
import { RemoteService } from "./remoteService";
import { ServiceMap } from "./serviceMap";

export class WorkerServiceManager extends ServiceMap {
  constructor(localServiceMap, remoteServiceMap,
              messageTransformer: MessageTransformer = new DefaultMessageTransformer()) {
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
export { BasicPortHandler } from "./port/BasicPortHandler";
export { AsyncPortHandler } from "./port/AsyncPortHandler";
export { LazyPortHandler } from "./port/LazyPortHandler";
export { DefaultMessageTransformer } from "./messageTransformers/defaultMessageTransformer";
export { AutoTransferrableMessageTransformer } from "./messageTransformers/autoTransferrableMessageTransformer";
