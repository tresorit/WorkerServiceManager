import { DeferredPromise } from "./deferredPromise";
import {MessageTransformer, Transferable} from "./messageTransformers/messageTransformer";

export interface IMessagePort {
  onmessage: (event: MessageEvent) => void | Promise<void>;
  terminate: () => void;

  postMessage(data: any[], transfers?: any[]);
  postMessage(data: any[], port: string, transfers?: any[]);
}

enum PortCommands {
  call,
  fire,
  resolve,
  reject,
}

export class PortHandler {
  private callHandler: (service, method, args) => Promise<any>;
  private deferreds: Map<number, DeferredPromise<any>>;
  private nextPid: number;
  private port: IMessagePort;

  constructor(private portPromise: Promise<IMessagePort> | IMessagePort, private messageTransformer: MessageTransformer, private targetOrigin?: string) {
    this.nextPid = 0;
    this.deferreds = new Map<number, DeferredPromise<any>>();
    this.callHandler = null;
    if (!(this.portPromise instanceof Promise)) {
      this.port = this.portPromise;
      this.port.onmessage = this.handleMessage.bind(this);
    } else this.portPromise.then((port) => {
          this.port = port;
          this.port.onmessage = this.handleMessage.bind(this);
      });
  }

  public async terminate() {
      const port = this.port ? this.port : await this.portPromise;

      port.onmessage = undefined;
      port.terminate();

      this.portPromise = undefined;
      this.port = undefined;
  }

  public async call(service, method, args): Promise<any> {
    if (!this.port && !this.portPromise)
      throw new Error("PortTerminated");
    const deferred = new DeferredPromise<any>();
    const pid = this.nextPid++;
    this.deferreds.set(pid, deferred);
    const msg = this.messageTransformer.transformMessage(args);
    await this.postMessage([PortCommands.call, pid, service, method, msg[0]], msg[1], this.targetOrigin);
    return deferred.promise;
  }

  public setCallHandler(handler) {
    if (this.callHandler !== null) throw new Error("Call handler already set");
    this.callHandler = handler;
  }

  public fire(service, method, args): Promise<void> {
    if (!this.port && !this.portPromise)
      throw new Error("PortTerminated");

    const msg = this.messageTransformer.transformMessage(args);
    return this.postMessage([PortCommands.fire, service, method, msg[0]], msg[1], this.targetOrigin);
  }

  private async postMessage(msg: any, transferables: Transferable[], origin?: string) {
    const port = this.port ? this.port : await this.portPromise;
    if (this.targetOrigin)
      port.postMessage(msg, this.targetOrigin, transferables);
    else
      port.postMessage(msg, transferables);
  }

  private async handleMessage(ev) {
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
          await this.postMessage([PortCommands.resolve, ev.data[1], msg[0]], msg[1], this.targetOrigin);
        } catch (ex) {
          const msg = this.messageTransformer.transformMessage(ex);
          await this.postMessage([PortCommands.reject, ev.data[1], msg[0]], msg[1], this.targetOrigin);
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
