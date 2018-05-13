import {IMessagePort} from "../../src/port/IPortHandler";

export class PortPair {
  public port2: IMessagePort;
  public port1: IMessagePort;

  constructor() {
    this.port1 = {
      onmessage: null,
      postMessage: (data) => {
        this.port2.onmessage({data} as any);
      },
      terminate: () => {},
    };

    this.port2 = {
      onmessage: null,
      postMessage: (data) => {
        this.port1.onmessage({data} as any);
      },
      terminate: () => {},
    };
  }
};
