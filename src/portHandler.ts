import { DeferredPromise } from "./deferredPromise";

export interface IMessagePort {
  onmessage: (event: MessageEvent) => void | Promise<void>;

  postMessage(data: any[], transfers?: any[]);
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

  constructor(private port: IMessagePort) {
    this.nextPid = 0;
    this.deferreds = new Map<number, DeferredPromise<any>>();
    this.callHandler = null;
    this.port.onmessage = this.handleMessage.bind(this);
  }

  public async call(service, method, args): Promise<any> {
    const deferred = new DeferredPromise<any>();
    const pid = this.nextPid++;
    this.deferreds.set(pid, deferred);
    this.port.postMessage([PortCommands.call, pid, service, method, args]);
    return deferred.promise;
  }

  public setCallHandler(handler) {
    if (this.callHandler !== null) throw new Error("Call handler already set");
    this.callHandler = handler;
  }

  public fire(service, method, args): void {
    this.port.postMessage([PortCommands.fire, service, method, args]);
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
          this.port.postMessage([PortCommands.resolve, ev.data[1], res]);
        } catch (ex) {
          this.port.postMessage([PortCommands.reject, ev.data[1], ex]);
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
