import { MessageTransformer, Transferable } from "./messageTransformer";
export declare class DefaultMessageTransformer implements MessageTransformer {
    private transform(message, visited);
    transformMessage(message: any): [any, Transferable[]];
}
