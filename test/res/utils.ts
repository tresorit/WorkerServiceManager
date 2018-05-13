export namespace utils {
  export function sleep(delay) {
    return new Promise((res) => setTimeout(res, delay));
  }
}
