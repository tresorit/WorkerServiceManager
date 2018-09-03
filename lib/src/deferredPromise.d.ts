export declare class DeferredPromise<T> {
    promise: Promise<T>;
    resolve: (value?: PromiseLike<T> | T) => void;
    reject: (reason?: any) => void;
    constructor();
}
