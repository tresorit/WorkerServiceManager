export class DeferredPromise<T> {
  public promise: Promise<T>;
  public resolve: (value?: PromiseLike<T> | T) => void;
  public reject: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}
