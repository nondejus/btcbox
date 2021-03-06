import * as _ from "lodash";

export function eRound(n: number): number {
  return _.round(n, 10);
}

export const nonce: () => string = (function() {
  let prev = 0;
  return function() {
    const n = Date.now();
    if (n <= prev) {
      prev += 1;
      return prev.toString();
    }
    prev = n;
    return prev.toString();
  };
})();

export function delay(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}