import { IMessageTransformer } from "./messageTransformers/IMessageTransformer";
import { ServiceMap } from "./serviceMap";
export declare class WorkerServiceManager extends ServiceMap {
    constructor(localServiceMap: any, remoteServiceMap: any, messageTransformer?: IMessageTransformer);
}
export { MultiRemoteService } from "./multiRemoteService";
export { RemoteService } from "./remoteService";
export { IWorkerMessagePort } from "./port/IPortHandler";
export { BasicPortHandler } from "./port/BasicPortHandler";
export { AsyncPortHandler } from "./port/AsyncPortHandler";
export { LazyPortHandler } from "./port/LazyPortHandler";
export { WorkerGlobalPortHandler } from "./port/WorkerGlobalPortHandler";
export { DefaultMessageTransformer } from "./messageTransformers/defaultMessageTransformer";
export { AutoTransferrableMessageTransformer } from "./messageTransformers/autoTransferrableMessageTransformer";
