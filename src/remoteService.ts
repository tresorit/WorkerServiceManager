import { PortHandler } from "./portHandler";

export class RemoteService {
  public name: string;

  constructor(private port: PortHandler) {}

  public async call(method, args = []) {
    if (this.port === undefined)
      throw new Error("RemoteDetached");

    return await this.port.call(this.name, method, args);
  }

  public detach(): PortHandler {
      const port = this.port;
      this.port = undefined;
      return port;
  }
}
