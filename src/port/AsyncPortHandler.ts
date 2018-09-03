import { IMessageTransformer, Transferable } from "../messageTransformers/IMessageTransformer";
import { BasicPortHandler } from "./BasicPortHandler";
import { IWorkerMessagePort } from "./IPortHandler";

export class AsyncPortHandler extends BasicPortHandler {
  constructor(protected portPromise: Promise<IWorkerMessagePort>, messageTransformer: IMessageTransformer) {
    super(undefined, messageTransformer);
  }

  public async terminate(): Promise<void> {
    await this.ensurePort();
    this.portPromise = undefined;
    return super.terminate();
  }

  protected async postMessage(msg: any, transferables: Transferable[]): Promise<void> {
    await this.ensurePort();
    return super.postMessage(msg, transferables);
  }

  protected async ensurePort(): Promise<void> {
    if (!this.port && this.portPromise) {
      this.port = await this.portPromise;
      this.port.onmessage = this.handleMessage.bind(this);
    }
  }
}
