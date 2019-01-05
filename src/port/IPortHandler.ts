export interface IWorkerMessagePort {
  onmessage: (event: MessageEvent) => void | Promise<void>;
  terminate: () => void;

  postMessage(data: any, transfers?: any[]): void;
}

export function isPortHandler(portHandler: any): portHandler is IPortHandler {
  return (portHandler as IPortHandler).terminate !== undefined &&
    (portHandler as IPortHandler).setCallHandler !== undefined &&
    (portHandler as IPortHandler).call !== undefined &&
    (portHandler as IPortHandler).fire !== undefined;
}

export interface IPortHandler {
  terminate(): Promise<void>;

  setCallHandler(handler): void;

  call(service, method, args): Promise<any>;

  fire(service, method, args): Promise<void>;
}
