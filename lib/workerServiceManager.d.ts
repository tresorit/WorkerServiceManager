import { MessageTransformer } from "./messageTransformers/messageTransformer";
import { ServiceMap } from "./serviceMap";
export declare class WorkerServiceManager extends ServiceMap {
    constructor(localServiceMap: any, remoteServiceMap: any, messageTransformer?: MessageTransformer);
}
export { MultiRemoteService } from "./multiRemoteService";
export { RemoteService } from "./remoteService";
export { BasicPortHandler } from "./port/BasicPortHandler";
