import { IWorkerMessagePort } from "../../src/port/IPortHandler";

export class PortPair {
  public port2: IWorkerMessagePort;
  public port1: IWorkerMessagePort;

  constructor() {
    this.port1 = {
      onmessage: null,
      postMessage: (data) => {
        this.port2.onmessage({ data } as any);
      },
      terminate: () => { },
    };

    this.port2 = {
      onmessage: null,
      postMessage: (data) => {
        this.port1.onmessage({ data } as any);
      },
      terminate: () => { },
    };
  }
};
