export interface IWorkerMessagePort {
    onmessage: (event: MessageEvent) => void | Promise<void>;
    terminate: () => void;
    postMessage(data: any, transfers?: any[]): void;
}
export declare function isPortHandler(portHandler: any): portHandler is IPortHandler;
export interface IPortHandler {
    terminate(): Promise<void>;
    setCallHandler(handler: any): void;
    call(service: any, method: any, args: any): Promise<any>;
    fire(service: any, method: any, args: any): Promise<void>;
}
