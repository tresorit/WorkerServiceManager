import { IMessageTransformer, Transferable } from "../messageTransformers/IMessageTransformer";
import { AsyncPortHandler } from "./AsyncPortHandler";
import { IWorkerMessagePort } from "./IPortHandler";
export declare class LazyPortHandler extends AsyncPortHandler {
    private portFactory;
    constructor(portFactory: () => Promise<IWorkerMessagePort>, messageTransformer: IMessageTransformer);
    terminate(): Promise<void>;
    protected postMessage(msg: any, transferables: Transferable[]): Promise<void>;
    protected ensurePort(): Promise<void>;
}
