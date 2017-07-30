import {PortHandler} from "./PortHandler";

export class ServiceMap {
    services: Map<string, any>;

    constructor(){
        this.services = new Map<string, any>();
    }

    addPort(port: any) {
        const handler = new PortHandler(port);
        handler.setCallHandler(this.handleCall.bind(this));
        return handler;
    }

    addServiceObject(name, obj: any) {
        return this.services.set(name, obj);
    }

    async handleCall(service: string, method: string, args: any[]) {
        const serviceObj = this.services.get(service);
        if(serviceObj !== undefined)
            return await serviceObj[method](...args);

        // We don't know about this service at all...
        throw new Error("Service not found")
    }
}