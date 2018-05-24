import { IMessageTransformer } from "./messageTransformers/IMessageTransformer";
import { IPortHandler, IWorkerMessagePort } from "./port/IPortHandler";
export declare class ServiceMap {
    private messageTransformer;
    services: Map<string, any>;
    ports: IPortHandler[];
    constructor(messageTransformer?: IMessageTransformer);
    addPort(port: IWorkerMessagePort | Promise<IWorkerMessagePort> | (() => Promise<IWorkerMessagePort>)): any;
    terminatePort(handler: IPortHandler): void;
    addServiceObject(name: any, obj: any): Map<string, any>;
    handleCall(service: string, method: string, args: any[]): Promise<any>;
}
