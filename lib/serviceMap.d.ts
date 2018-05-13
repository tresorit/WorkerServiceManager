import { MessageTransformer } from "./messageTransformers/messageTransformer";
import { IMessagePort, IPortHandler } from "./port/IPortHandler";
export declare class ServiceMap {
    private messageTransformer;
    services: Map<string, any>;
    ports: IPortHandler[];
    constructor(messageTransformer?: MessageTransformer);
    addPort(port: IMessagePort | Promise<IMessagePort> | (() => Promise<IMessagePort>)): any;
    terminatePort(handler: IPortHandler): void;
    addServiceObject(name: any, obj: any): Map<string, any>;
    handleCall(service: string, method: string, args: any[]): Promise<any>;
}
