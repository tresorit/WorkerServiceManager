import { MessageTransformer } from "./messageTransformers/messageTransformer";
import { IMessagePort, IPortHandler } from "./port/IPortHandler";
import { RemoteService } from "./remoteService";
import { ServiceMap } from "./serviceMap";
export declare class MultiRemoteService<T extends RemoteService> {
    private serviceMap;
    private portFactory;
    private proxyType;
    private maxPorts;
    private minPorts;
    private messageTransformer;
    private busyPorts;
    private freePorts;
    private queue;
    constructor(serviceMap: ServiceMap, portFactory: () => Promise<IMessagePort>, proxyType: new (ph: IPortHandler) => T, maxPorts: number, minPorts?: number, messageTransformer?: MessageTransformer);
    spinUp(): void;
    getRemote(): Promise<T>;
    releaseRemote(remote: T): void;
    private releasePort(portHandler);
    private getNewPort();
}
