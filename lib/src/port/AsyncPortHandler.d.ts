import { IMessageTransformer, Transferable } from "../messageTransformers/IMessageTransformer";
import { BasicPortHandler } from "./BasicPortHandler";
import { IWorkerMessagePort } from "./IPortHandler";
export declare class AsyncPortHandler extends BasicPortHandler {
    protected portPromise: Promise<IWorkerMessagePort>;
    constructor(portPromise: Promise<IWorkerMessagePort>, messageTransformer: IMessageTransformer);
    terminate(): Promise<void>;
    protected postMessage(msg: any, transferables: Transferable[]): Promise<void>;
    protected ensurePort(): Promise<void>;
}
