import { PortHandler } from "./portHandler";
export declare class ServiceMap {
    services: Map<string, any>;
    ports: PortHandler[];
    constructor();
    addPort(port: any): PortHandler;
    terminatePort(handler: PortHandler): void;
    addServiceObject(name: any, obj: any): Map<string, any>;
    handleCall(service: string, method: string, args: any[]): Promise<any>;
}
