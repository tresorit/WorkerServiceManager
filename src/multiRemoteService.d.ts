import { IMessagePort, PortHandler } from "./portHandler";
import { RemoteService } from "./remoteService";
import { ServiceMap } from "./serviceMap";
import { MessageTransformer } from "./messageTransformers/messageTransformer";
export declare class MultiRemoteService<T extends RemoteService> {
    private serviceMap;
    private portFactory;
    private proxyType;
    private messageTransformer;
    private maxPorts;
    private minPorts;
    private busyPorts;
    private freePorts;
    private queue;
    constructor(serviceMap: ServiceMap, portFactory: () => Promise<IMessagePort>, proxyType: new (ph: PortHandler) => T, messageTransformer: MessageTransformer, maxPorts: number, minPorts?: number);
    spinUp(): void;
    getRemote(): Promise<T>;
    releaseRemote(remote: T): void;
    private releasePort(portHandler);
    private getNewPort();
}
