import { IMessageTransformer, Transferable } from "../messageTransformers/IMessageTransformer";
import { BasicPortHandler } from "./BasicPortHandler";
export declare class WorkerGlobalPortHandler extends BasicPortHandler {
    constructor(messageTransformer: IMessageTransformer);
    terminate(): Promise<void>;
    protected postMessage(msg: any, transferables: Transferable[]): Promise<void>;
}
