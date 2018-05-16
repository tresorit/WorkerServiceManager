import {MessageTransformer, Transferable} from "./messageTransformer";

function transformError(err) {
  return {
    message: err.message,
    name: err.name,
    stack: err.stack,
  };
}

export class AutoTransferrableMessageTransformer implements MessageTransformer {
  public transformMessage(message: any): [any, Transferable[]] {
    return this.transform(message, new Map<any, boolean>()).slice(0, 2) as [any, Transferable[]];
  }

  private transform(message: any, copies: Map<any, any>): [any, Transferable[], boolean] {
    if (message && typeof message === "object") {
      if (copies.has(message))
        return [copies.get(message), [], true];

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
            return [message, [message.buffer], false];
          } else {
            const copy = new message.constructor(message);
            copies.set(message, copy);
            return [copy, [copy.buffer], true];
          }
      case "[object Blob]":
          return [message, [], false];
        case "[object Array]":
          const arrRes = message.map((e) => this.transform(e, copies));
          const copiedArr = arrRes.reduce((a, c) => a || c, false);
          const arrTransferables = arrRes.reduce((a, c) => a.concat(c[1]), []);

          if (copiedArr) {
            const copyArr = arrRes.map((a) => a[0]);
            copies.set(message, copyArr);
            return [copyArr, arrTransferables, true];
          }
          return [message, arrTransferables, false];
        case "[object Promise]":
        case "[object XMLHttpRequest]":
        case "[object Event]":
          throw new Error("CommunicationErrorNonMessageableValue");
        case "[object DOMError]":
        case "[object DOMException]":
          const copyDOMError = transformError(message);
          copies.set(message, copyDOMError);
          return [copyDOMError, [], true];
        default:
          if (message instanceof Error) {
            const copyError = transformError(message);
            copies.set(message, copyError);
            return [copyError, [], true];
          }
          const resObj = {};
          let transferrables = [];
          for (const key of Object.keys(message)) {
            if (!key.startsWith("_")) {
              const cRes = this.transform(message[key], copies);
              transferrables = transferrables.concat(cRes[1]);
              resObj[key] = cRes[0];
            }
          }
          copies.set(message, resObj);
          return [resObj, transferrables, true];
      }
    }
    return [message, [], false];
  }
}
