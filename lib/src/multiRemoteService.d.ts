import { IMessageTransformer } from "./messageTransformers/IMessageTransformer";
import { IWorkerMessagePort, IPortHandler } from "./port/IPortHandler";
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
    constructor(serviceMap: ServiceMap, portFactory: () => Promise<IWorkerMessagePort>, proxyType: new (ph: IPortHandler) => T, maxPorts: number, minPorts?: number, messageTransformer?: IMessageTransformer);
    spinUp(): void;
    getRemote(): Promise<T>;
    releaseRemote(remote: T): void;
    private releasePort(portHandler);
    private getNewPort();
}
