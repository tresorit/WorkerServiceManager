export interface Port {
    postMessage(data: any[], transfers?: any[]): any;
    onmessage: (event: MessageEvent) => void | Promise<void>;
}
export declare class PortHandler {
    private port;
    private callHandler;
    private deferreds;
    private nextPid;
    constructor(port: Port);
    call(service: any, method: any, args: any): Promise<any>;
    setCallHandler(handler: any): void;
    fire(service: any, method: any, args: any): void;
    private handleMessage(ev);
}
