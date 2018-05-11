import {DeferredPromise} from "./deferredPromise";
import {IMessagePort, PortHandler} from "./portHandler";
import {RemoteService} from "./remoteService";
import {ServiceMap} from "./serviceMap";
import {MessageTransformer} from "./messageTransformers/messageTransformer";
import {DefaultMessageTransformer} from "./messageTransformers/defaultMessageTransformer";

export class MultiRemoteService<T extends RemoteService> {
    private busyPorts: T[];
    private freePorts: PortHandler[];

    private queue: Array<DeferredPromise<PortHandler>>;

    constructor(private serviceMap: ServiceMap,
                private portFactory: () => Promise<IMessagePort>, private proxyType: new (ph: PortHandler) => T,
                private maxPorts: number, private minPorts: number = 0,
                private messageTransformer: MessageTransformer = new DefaultMessageTransformer(),
                ) {
        this.busyPorts = [];
        this.freePorts = [];
        this.queue = [];
    }

    public spinUp() {
        while (this.freePorts.length < this.minPorts)
            this.releasePort(this.getNewPort());
    }

    public async getRemote(): Promise<T> {
      let portHandler: PortHandler;
      if (this.busyPorts.length >= this.maxPorts) {
          const prom = new DeferredPromise<PortHandler>();
          this.queue.push(prom);
          portHandler = await prom.promise;
      } else if (this.freePorts.length > 0)
          portHandler = this.freePorts.shift();
      else
          portHandler = this.getNewPort();

      const remote = new this.proxyType(portHandler);
      this.busyPorts.push(remote);

      return remote;
    }

    public releaseRemote(remote: T): void {
        const portHandler = remote.detach();

        this.busyPorts.splice(this.busyPorts.indexOf(remote), 1);

        this.releasePort(portHandler);
    }

    private releasePort(portHandler: PortHandler): void {
        if (this.queue.length > 0) {
            const deferred = this.queue.shift();
            deferred.resolve(portHandler);
        } else if (this.freePorts.length < this.minPorts)
            this.freePorts.push(portHandler);
        else // noinspection JSIgnoredPromiseFromCall
            portHandler.terminate();
    }

    private getNewPort() {
        const ph = new PortHandler(this.portFactory(), this.messageTransformer);
        ph.setCallHandler(this.serviceMap.handleCall.bind(this.serviceMap));
        return ph;
    }
}
