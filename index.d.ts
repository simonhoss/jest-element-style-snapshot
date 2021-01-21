import type { Page } from "puppeteer";

export function toMatchElementStyleSnapshotFromPage(
  page: Page
): { message(): string; pass: boolean };

export function configureToMatchElementStyleSnapshotFromPage(): () => {
  message(): string;
  pass: boolean;
};

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toMatchElementStyleSnapshotFromPage(page: Page): R;
    }
  }
}
