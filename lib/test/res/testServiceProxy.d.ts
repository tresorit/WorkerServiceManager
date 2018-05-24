import { RemoteService } from "../../src/remoteService";
export declare class TestServiceProxy extends RemoteService {
    constructor(port: any);
    testFunction(...args: any[]): Promise<any>;
    testEcho(...args: any[]): Promise<any>;
    testAsyncEcho(...args: any[]): Promise<any>;
    testErr(): Promise<any>;
}
