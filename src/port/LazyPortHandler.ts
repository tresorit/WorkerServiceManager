import {MessageTransformer, Transferable} from "../messageTransformers/messageTransformer";
import {AsyncPortHandler} from "./AsyncPortHandler";
import {IMessagePort} from "./IPortHandler";

export class LazyPortHandler extends AsyncPortHandler {
  constructor(private portFactory: () => Promise<IMessagePort>, messageTransformer: MessageTransformer) {
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
    if (!this.port && this.portFactory)
      this.portPromise = this.portFactory();

    return super.ensurePort();
  }
}
