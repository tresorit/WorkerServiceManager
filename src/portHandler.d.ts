import { MessageTransformer } from "./messageTransformers/messageTransformer";
export interface IMessagePort {
    onmessage: (event: MessageEvent) => void | Promise<void>;
    terminate: () => void;
    postMessage(data: any[], transfers?: any[]): any;
    postMessage(data: any[], port: string, transfers?: any[]): any;
}
export declare class PortHandler {
    private portPromise;
    private messageTransformer;
    private targetOrigin;
    private callHandler;
    private deferreds;
    private nextPid;
    private port;
    constructor(portPromise: Promise<IMessagePort> | IMessagePort, messageTransformer: MessageTransformer, targetOrigin?: string);
    terminate(): Promise<void>;
    call(service: any, method: any, args: any): Promise<any>;
    setCallHandler(handler: any): void;
    fire(service: any, method: any, args: any): Promise<void>;
    private postMessage(msg, transferables, origin?);
    private handleMessage(ev);
}
