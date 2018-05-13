import {MessageTransformer, Transferable} from "./messageTransformer";

function transformError(err) {
  return {
    message: err.message,
    name: err.name,
    stack: err.stack,
  };
}

export class DefaultMessageTransformer implements MessageTransformer {
  private transform(message: any, visited: Map<any, boolean>): [any, Transferable[], boolean] {
    if (message && typeof message === "object") {
      visited.set(message, false);
      switch (Object.prototype.toString.call(message)) {
        case "[object ArrayBuffer]":
        case "[object Uint8Array]":
        case "[object Int8Array]":
        case "[object Uint16Array]":
        case "[object Int16Array]":
        case "[object Uint32Array]":
        case "[object Int32Array]":
        case "[object Float32Array]":
        case "[object Float64Array]":
          if (message.buffer.byteLength === message.byteLength) {
            visited.set(message, false);
            return [message, [message.buffer], false];
          } else {
            const copy = new message.constructor(message);
            visited.set(message, true);
            return [copy, [copy.buffer], true];
          }
        case "[object Array]":
          const res = message.map((e) => this.transform(e, visited));
          const copied = res.reduce((a, c) => a || c, false);
          visited.set(message, copied);
          return [copied ? res.map((a) => a[0]) : message, res.reduce((a, c) => a.concat(c[1]), []), copied];
        case "[object Promise]":
        case "[object XMLHttpRequest]":
        case "[object Event]":
          throw new Error("CommunicationErrorNonMessageableValue");
        case "[object DOMError]":
        case "[object DOMException]":
          visited.set(message, true);
          return [transformError(message), [], true];
        default:
          if (message instanceof Error) {
            visited.set(message, true);
            return [transformError(message), [], true];
          }
          const resObj = {};
          let transferrables = [];
          let copiedObj = false;
          for (const key of Object.keys(message)) {
            if (!key.startsWith("_") || visited.has(key)) {
              const cRes = this.transform(message[key], visited);
              transferrables = transferrables.concat(cRes[1]);
              if (cRes[2]) {
                copiedObj = true;
                resObj[key] = copiedObj;
              } else {
                resObj[key] = message[key];
              }
            }
          }
          visited.set(message, copiedObj);
          return [copiedObj ? resObj : message, transferrables, copiedObj];
      }
    }
    return [message, [], false];
  }

  public transformMessage(message: any): [any, Transferable[]] {
    return this.transform(message, new Map<any, boolean>()).slice(0, 2) as [any, Transferable[]];
  }
}
