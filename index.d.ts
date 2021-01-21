import type { JSEvalable } from "puppeteer";

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
