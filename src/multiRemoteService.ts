import { DeferredPromise } from './deferredPromise';
import { DefaultMessageTransformer } from './messageTransformers/defaultMessageTransformer';
import { IMessageTransformer } from './messageTransformers/IMessageTransformer';
import { AsyncPortHandler } from './port/AsyncPortHandler';
import { IWorkerMessagePort, IPortHandler } from './port/IPortHandler';
import { RemoteService } from './remoteService';
import { ServiceMap } from './serviceMap';

export class MultiRemoteService<T extends RemoteService> {
  private busyPorts: T[];
  private freePorts: IPortHandler[];

  private queue: Array<DeferredPromise<IPortHandler>>;

  constructor(
    private serviceMap: ServiceMap,
    private portFactory: () => Promise<IWorkerMessagePort>,
    private proxyType: new (ph: IPortHandler) => T,
    private maxPorts: number,
    private minPorts: number = 0,
    private messageTransformer: IMessageTransformer = new DefaultMessageTransformer(),
    private reuseRemotes: boolean = true,
  ) {
    this.busyPorts = [];
    this.freePorts = [];
    this.queue = [];
  }

  public spinUp() {
    while (this.freePorts.length < this.minPorts) {
      this.releasePort(this.getNewPort());
    }
  }

  public async getRemote(): Promise<T> {
    let portHandler: IPortHandler;
    if (this.busyPorts.length >= this.maxPorts) {
      const prom = new DeferredPromise<IPortHandler>();
      this.queue.push(prom);
      portHandler = await prom.promise;
    } else if (this.freePorts.length > 0) {
      portHandler = this.freePorts.shift();
    } else {
      portHandler = this.getNewPort();
    }

    const remote = new this.proxyType(portHandler);
    this.busyPorts.push(remote);

    return remote;
  }

  public releaseRemote(remote: T): void {
    const portHandler = remote.detach();

    this.busyPorts.splice(this.busyPorts.indexOf(remote), 1);

    this.releasePort(portHandler);
  }

  private releasePort(portHandler: IPortHandler): void {
    if (this.queue.length > 0) {
      const deferred = this.queue.shift();
      if (this.reuseRemotes) {
        deferred.resolve(portHandler);
      } else {
        // noinspection JSIgnoredPromiseFromCall
        portHandler.terminate();
        deferred.resolve(this.getNewPort());
      }
    } else if (this.freePorts.length < this.minPorts) {
      if (this.reuseRemotes) {
        this.freePorts.push(portHandler);
      } else {
        // noinspection JSIgnoredPromiseFromCall
        portHandler.terminate();
        this.freePorts.push(this.getNewPort());
      }
    } else {
      // noinspection JSIgnoredPromiseFromCall
      portHandler.terminate();
    }
  }

  private getNewPort() {
    const ph = new AsyncPortHandler(this.portFactory(), this.messageTransformer);
    ph.setCallHandler(this.serviceMap.handleCall.bind(this.serviceMap));
    return ph;
  }
}
