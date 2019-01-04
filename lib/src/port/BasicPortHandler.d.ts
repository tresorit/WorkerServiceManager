import { IMessageTransformer, Transferable } from "../messageTransformers/IMessageTransformer";
import { IPortHandler, IWorkerMessagePort } from "./IPortHandler";
export declare class BasicPortHandler implements IPortHandler {
    protected port: IWorkerMessagePort | null;
    protected messageTransformer: IMessageTransformer;
    private callHandler;
    private deferreds;
    private nextPid;
    constructor(port: IWorkerMessagePort | null, messageTransformer: IMessageTransformer);
    terminate(): Promise<void>;
    call(service: any, method: any, args: any): Promise<any>;
    setCallHandler(handler: any): void;
    fire(service: any, method: any, args: any): Promise<void>;
    protected postMessage(msg: any, transferables: Transferable[]): Promise<void>;
    protected handleMessage(ev: any): Promise<void>;
}
