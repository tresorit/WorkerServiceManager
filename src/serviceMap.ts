import {DefaultMessageTransformer} from "./messageTransformers/defaultMessageTransformer";
import {IMessageTransformer} from "./messageTransformers/IMessageTransformer";
import {AsyncPortHandler} from "./port/AsyncPortHandler";
import {BasicPortHandler} from "./port/BasicPortHandler";
import {IPortHandler, IWorkerMessagePort} from "./port/IPortHandler";
import {LazyPortHandler} from "./port/LazyPortHandler";

export class ServiceMap {
  public services: Map<string, any>;
  public ports: IPortHandler[];

  constructor(private messageTransformer: IMessageTransformer = new DefaultMessageTransformer()) {
    this.services = new Map<string, any>();
    this.ports = [];
  }

  public addPort(port: IWorkerMessagePort | Promise<IWorkerMessagePort> | (() => Promise<IWorkerMessagePort>)) {
    let handler;
    if (typeof port === "function") {
      handler = new LazyPortHandler(port, this.messageTransformer);
    } else if (port instanceof Promise) {
      handler = new AsyncPortHandler(port, this.messageTransformer);
         } else {
      handler = new BasicPortHandler(port, this.messageTransformer);
         }

    handler.setCallHandler(this.handleCall.bind(this));
    this.ports.push(handler);
    return handler;
  }

  public terminatePort(handler: IPortHandler): void {
    this.ports.splice(this.ports.indexOf(handler), 1);
    // noinspection JSIgnoredPromiseFromCall
    handler.terminate();
  }

  public addServiceObject(name, obj: any) {
    return this.services.set(name, obj);
  }

  public async handleCall(service: string, method: string, args: any[]) {
    const serviceObj = this.services.get(service);
    if (serviceObj !== undefined) return await serviceObj[method](...args);

    // We don't know about this service at all...
    throw new Error("Service not found");
  }
}
