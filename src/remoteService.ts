import { PortHandler } from "./portHandler";

export class RemoteService {
  public name: string;

  constructor(private port: PortHandler) {}

  public async call(method, args = []) {
    return await this.port.call(this.name, method, args);
  }
}
