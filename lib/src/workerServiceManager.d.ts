import { IMessageTransformer } from "./messageTransformers/IMessageTransformer";
import { ServiceMap } from "./serviceMap";
export declare class WorkerServiceManager extends ServiceMap {
    constructor(localServiceMap: any, remoteServiceMap: any, messageTransformer?: IMessageTransformer);
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
