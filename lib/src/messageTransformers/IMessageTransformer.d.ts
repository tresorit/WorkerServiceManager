export declare type Transferable = ArrayBuffer | ImageBitmap | MessagePort;
export interface IMessageTransformer {
    transformMessage(message: any): [any, Transferable[]];
}
