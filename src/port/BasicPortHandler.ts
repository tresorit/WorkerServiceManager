import {DeferredPromise} from "../deferredPromise";
import {IMessageTransformer, Transferable} from "../messageTransformers/IMessageTransformer";
import {IPortHandler, IWorkerMessagePort} from "./IPortHandler";

enum PortCommands {
  call,
  fire,
  resolve,
  reject,
}

export class BasicPortHandler implements IPortHandler {
  private callHandler: (service, method, args) => Promise<any>;
  private deferreds: Map<number, DeferredPromise<any>>;
  private nextPid: number;

  constructor(protected port: IWorkerMessagePort|null, protected messageTransformer: IMessageTransformer) {
    this.nextPid = 0;
    this.deferreds = new Map<number, DeferredPromise<any>>();
    this.callHandler = null;

    if (this.port) {
      this.port.onmessage = this.handleMessage.bind(this);
    }
  }

  public async terminate(): Promise<void> {
    const port = this.port;

    port.onmessage = undefined;
    port.terminate();

    this.port = undefined;
  }

  public async call(service, method, args): Promise<any> {
    const deferred = new DeferredPromise<any>();
    const pid = this.nextPid++;
    this.deferreds.set(pid, deferred);
    const msg = this.messageTransformer.transformMessage(args);
    try {
      await this.postMessage([PortCommands.call, pid, service, method, msg[0]], msg[1]);
    } catch (ex) {
      deferred.reject(ex);
    }
    return deferred.promise;
  }

  public setCallHandler(handler): void {
    if (this.callHandler !== null) throw new Error("Call handler already set");
    this.callHandler = handler;
  }

  public fire(service, method, args): Promise<void> {
    const msg = this.messageTransformer.transformMessage(args);
    return this.postMessage([PortCommands.fire, service, method, msg[0]], msg[1]);
  }

  protected async postMessage(msg: any, transferables: Transferable[]): Promise<void> {
    if (!this.port) {
      throw new Error("PortTerminated");
    }

    this.port.postMessage(msg, transferables);
  }

  protected async handleMessage(ev: any): Promise<void> {
    switch (ev.data[0]) { // cmd
      case PortCommands.fire:
        try {
          // We intentionally ignore the result (and even the errors) of the call. This is rarely a good idea,
          // but it is sometimes useful.
          //noinspection JSIgnoredPromiseFromCall
          this.callHandler(ev.data[2], ev.data[3], ev.data[4]);
        } catch (ex) {
          // We ignore errors during calls because we have no way to handle them.
          // TODO: add an settable error handler/logger
          // console.error(ex);
        }
        break;
      case PortCommands.call:
        try {
          const res = await this.callHandler(
            ev.data[2],
            ev.data[3],
            ev.data[4],
          );
          const msg = this.messageTransformer.transformMessage(res);
          await this.postMessage([PortCommands.resolve, ev.data[1], msg[0]], msg[1]);
        } catch (ex) {
          const msg = this.messageTransformer.transformMessage(ex);
          await this.postMessage([PortCommands.reject, ev.data[1], msg[0]], msg[1]);
        }
        break;
      case PortCommands.resolve:
        this.deferreds.get(ev.data[1]).resolve(ev.data[2]);
        this.deferreds.delete(ev.data[1]);
        break;
      case PortCommands.reject:
        this.deferreds.get(ev.data[1]).reject(ev.data[2]);
        this.deferreds.delete(ev.data[1]);
        break;
    }
  }
}
