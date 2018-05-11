import { PortHandler } from "./portHandler";
import { MessageTransformer } from "./messageTransformers/messageTransformer";
export declare class ServiceMap {
    private messageTransformer;
    services: Map<string, any>;
    ports: PortHandler[];
    constructor(messageTransformer?: MessageTransformer);
    addPort(port: any): PortHandler;
    terminatePort(handler: PortHandler): void;
    addServiceObject(name: any, obj: any): Map<string, any>;
    handleCall(service: string, method: string, args: any[]): Promise<any>;
}
