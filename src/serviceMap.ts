import { PortHandler } from "./portHandler";
import {MessageTransformer} from "./messageTransformers/messageTransformer";
import {DefaultMessageTransformer} from "./messageTransformers/defaultMessageTransformer";

export class ServiceMap {
  public services: Map<string, any>;
  public ports: PortHandler[];

  constructor(private messageTransformer: MessageTransformer = new DefaultMessageTransformer()) {
    this.services = new Map<string, any>();
    this.ports = [];
  }

  public addPort(port: any) {
    const handler = new PortHandler(port, this.messageTransformer);
    handler.setCallHandler(this.handleCall.bind(this));
    this.ports.push(handler);
    return handler;
  }

  public terminatePort(handler: PortHandler): void {
      this.ports.splice(this.ports.indexOf(handler), 1);
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
