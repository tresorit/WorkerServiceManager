import { PortHandler } from "./PortHandler";
export declare class ServiceMap {
    services: Map<string, any>;
    constructor();
    addPort(port: any): PortHandler;
    addServiceObject(name: any, obj: any): Map<string, any>;
    handleCall(service: string, method: string, args: any[]): Promise<any>;
}
