import { DefaultMessageTransformer } from "./messageTransformers/defaultMessageTransformer";
import { IMessageTransformer } from "./messageTransformers/IMessageTransformer";
import { isPortHandler } from "./port/IPortHandler";
import { ServiceMap } from "./serviceMap";

export class WorkerServiceManager extends ServiceMap {
  constructor(
    localServiceMap,
    remoteServiceMap,
    messageTransformer: IMessageTransformer = new DefaultMessageTransformer(),
  ) {
    super(messageTransformer);

    localServiceMap.forEach((obj, name) => this.addServiceObject(name, obj));

    remoteServiceMap.forEach((serviceProxyTypes, port) => {
      const portHandler = isPortHandler(port) ? port : this.addPort(port);

      serviceProxyTypes.forEach((serviceProxyInfo) => {
        const proxy = new serviceProxyInfo[1](portHandler);
        proxy.name = serviceProxyInfo[0];
        this.addServiceObject(serviceProxyInfo[0], proxy);
      });
    });
  }
}

export { AutoTransferrableMessageTransformer } from "./messageTransformers/autoTransferrableMessageTransformer";
export { DefaultMessageTransformer } from "./messageTransformers/defaultMessageTransformer";
export { MultiRemoteService } from "./multiRemoteService";
export { AsyncPortHandler } from "./port/AsyncPortHandler";
export { BasicPortHandler } from "./port/BasicPortHandler";
export { IPortHandler, IWorkerMessagePort } from "./port/IPortHandler";
export { LazyPortHandler } from "./port/LazyPortHandler";
export { WorkerGlobalPortHandler } from "./port/WorkerGlobalPortHandler";
export { RemoteService } from "./remoteService";

