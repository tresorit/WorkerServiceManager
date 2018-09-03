import { IMessageTransformer, Transferable } from "../messageTransformers/IMessageTransformer";
import { BasicPortHandler } from "./BasicPortHandler";

export class WorkerGlobalPortHandler extends BasicPortHandler {
    constructor(messageTransformer: IMessageTransformer) {
        super(null, messageTransformer);

        (self as DedicatedWorkerGlobalScope).onmessage = this.handleMessage.bind(this);
    }

    public terminate(): Promise<void> {
        throw new Error("ParentNotTerminableFromWorker");
    }

    protected async postMessage(msg: any, transferables: Transferable[]): Promise<void> {
        return (self as DedicatedWorkerGlobalScope).postMessage(msg, transferables);
    }
}
