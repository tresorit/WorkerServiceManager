module.exports = class PortPair {
  constructor() {
    this.port1 = {
      onmessage: null,
      postMessage: (data) => {
        this.port2.onmessage({data});
      },
      terminate: () => {},
    };

    this.port2 = {
      onmessage: null,
      postMessage: (data) => {
        this.port1.onmessage({data});
      },
      terminate: () => {},
    };
  }
};
