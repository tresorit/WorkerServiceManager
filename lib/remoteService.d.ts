import { IPortHandler } from "./port/IPortHandler";
export declare class RemoteService<PortType extends IPortHandler = IPortHandler> {
    private port;
    name: string;
    constructor(port: PortType);
    call(method: any, args?: any[]): Promise<any>;
    detach(): PortType;
}
