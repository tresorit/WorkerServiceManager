import { IMessageTransformer, Transferable } from "../messageTransformers/IMessageTransformer";
import { AsyncPortHandler } from "./AsyncPortHandler";
import { IWorkerMessagePort } from "./IPortHandler";

export class LazyPortHandler extends AsyncPortHandler {
  constructor(private portFactory: () => Promise<IWorkerMessagePort>, messageTransformer: IMessageTransformer) {
    super(undefined, messageTransformer);
  }

  public async terminate(): Promise<void> {
    await this.ensurePort();
    this.portFactory = undefined;
    return super.terminate();
  }

  protected async postMessage(msg: any, transferables: Transferable[]): Promise<void> {
    await this.ensurePort();
    return super.postMessage(msg, transferables);
  }

  protected async ensurePort(): Promise<void> {
    if (!this.portPromise && this.portFactory) {
      this.portPromise = this.portFactory();
    }

    return super.ensurePort();
  }
}
