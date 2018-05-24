import { IMessageTransformer, Transferable } from "./IMessageTransformer";
export declare class DefaultMessageTransformer implements IMessageTransformer {
    transformMessage(message: any): [any, Transferable[]];
    private transform(message, copies);
}
