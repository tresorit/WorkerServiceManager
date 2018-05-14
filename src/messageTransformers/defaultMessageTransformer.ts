import {MessageTransformer, Transferable} from "./messageTransformer";

function transformError(err) {
  return {
    message: err.message,
    name: err.name,
    stack: err.stack,
  };
}

export class DefaultMessageTransformer implements MessageTransformer {
  public transformMessage(message: any): [any, Transferable[]] {
    return [this.transform(message, new Map<any, boolean>())[0], []];
  }

  private transform(message: any, copies: Map<any, any>): [any, boolean] {
    if (message && typeof message === "object") {
      if (copies.has(message))
        return [copies.get(message), true];

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
            return [message, false];
          } else {
            const copy = new message.constructor(message);
            copies.set(message, copy);
            return [copy, true];
          }
        case "[object Array]":
          const arrRes = message.map((e) => this.transform(e, copies));
          const copiedArr = arrRes.reduce((a, c) => a || c, false);

          if (copiedArr) {
            const copyArr = arrRes.map((a) => a[0]);
            copies.set(message, copyArr);
            return [copyArr, true];
          }
          return [message, false];
        case "[object Promise]":
        case "[object XMLHttpRequest]":
        case "[object Event]":
          throw new Error("CommunicationErrorNonMessageableValue");
        case "[object DOMError]":
        case "[object DOMException]":
          const copyDOMError = transformError(message);
          copies.set(message, copyDOMError);
          return [copyDOMError, true];
        default:
          if (message instanceof Error) {
            const copyError = transformError(message);
            copies.set(message, copyError);
            return [copyError, true];
          }

          const resObj = {};
          for (const key of Object.keys(message)) {
            if (!key.startsWith("_")) {
              const cRes = this.transform(message[key], copies);
              resObj[key] = cRes[0];
            }
          }
          copies.set(message, resObj);
          return [resObj, true];
      }
    }
    return [message, false];
  }
}
