export interface IMessagePort {
  onmessage: (event: MessageEvent) => void | Promise<void>;
  terminate: () => void;

  postMessage(data: any[], transfers?: any[]);

  postMessage(data: any[], port: string, transfers?: any[]);
}

export interface IPortHandler {
  terminate(): Promise<void>;

  setCallHandler(handler): void;

  call(service, method, args): Promise<any>;

  fire(service, method, args): Promise<void>;
}
