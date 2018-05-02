export interface IMessagePort {
    onmessage: (event: MessageEvent) => void | Promise<void>;
    terminate: () => void;
    postMessage(data: any[], transfers?: any[]): any;
}
export declare class PortHandler {
    private portPromise;
    private callHandler;
    private deferreds;
    private nextPid;
    private port;
    constructor(portPromise: Promise<IMessagePort> | IMessagePort);
    terminate(): Promise<void>;
    call(service: any, method: any, args: any): Promise<any>;
    setCallHandler(handler: any): void;
    fire(service: any, method: any, args: any): void;
    private handleMessage(ev);
}
