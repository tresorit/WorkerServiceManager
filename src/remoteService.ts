import {PortHandler} from "./PortHandler";

export class RemoteService {
    name: string;
    constructor(private port: PortHandler) {

    }

    async call(method, args = []) {
        return await this.port.call(this.name, method, args);
    }
}