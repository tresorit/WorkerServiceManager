export type Transferable  = ArrayBuffer|ImageBitmap|MessagePort;

export interface MessageTransformer {
    transformMessage(message: any): [any, Transferable[]]
}