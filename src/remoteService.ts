import { IPortHandler } from "./port/IPortHandler";

export class RemoteService<PortType extends IPortHandler = IPortHandler> {
    public name: string;

    constructor(private port: PortType) {}

    public async call(method, args = []) {
        if (this.port === undefined)
            throw new Error("RemoteDetached");

        return await this.port.call(this.name, method, args);
    }

    public detach(): PortType {
        const port = this.port;
        this.port = undefined;
        return port;
    }
}
