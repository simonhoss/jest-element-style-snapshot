export type EvaluateFn<T = any> = string | ((arg1: T, ...args: any[]) => any);
export type EvaluateFnReturnType<T extends EvaluateFn> = T extends (
  ...args: any[]
) => infer R
  ? R
  : unknown;

export interface JSEvalable<A = any> {
  /**
   * Evaluates a function in the browser context.
   * If the function, passed to the frame.evaluate, returns a Promise, then frame.evaluate would wait for the promise to resolve and return its value.
   * If the function passed into frame.evaluate returns a non-Serializable value, then frame.evaluate resolves to undefined.
   * @param fn Function to be evaluated in browser context
   * @param args Arguments to pass to `fn`
   */
  evaluate<T extends EvaluateFn<A>>(
    pageFunction: T,
    ...args: any[]
  ): Promise<
    EvaluateFnReturnType<T> extends PromiseLike<infer U>
      ? U
      : EvaluateFnReturnType<T>
  >;
}

export function toMatchElementStyleSnapshotFromPage(
  page: JSEvalable
): { message(): string; pass: boolean };

export function configureToMatchElementStyleSnapshotFromPage(): () => {
  message(): string;
  pass: boolean;
};

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toMatchElementStyleSnapshotFromPage(page: JSEvalable): R;
    }
  }
}
