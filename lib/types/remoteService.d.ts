import { PortHandler } from "./portHandler";
export declare class RemoteService {
    private port;
    name: string;
    constructor(port: PortHandler);
    call(method: any, args: any): Promise<any>;
}
