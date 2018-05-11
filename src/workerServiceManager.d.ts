import { ServiceMap } from "./serviceMap";
import { MessageTransformer } from "./messageTransformers/messageTransformer";
export declare class WorkerServiceManager extends ServiceMap {
    constructor(localServiceMap: any, remoteServiceMap: any, messageTransformer?: MessageTransformer);
}
export { MultiRemoteService } from "./multiRemoteService";
export { RemoteService } from "./remoteService";
export { PortHandler } from "./portHandler";
