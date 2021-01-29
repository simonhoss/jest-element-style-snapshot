<h1 align="center">jest-element-style-snapshot</h1>

# How it works

## The problem

To test if a website is looking the same, a lot of tools are using image comparement. But this leads to problem if a team has different environments for example Mac or Windows and even inside the system an update of a browser can break all the images, because of some render changes.

## The solution

The module jest-element-style-snapshot makes a snapshot of a given elemennt with all styles inside by using the browser function `getComputedStyle`

With this approach it is possible to find visual changes by only checking the style.

Under the hood jest-element-style-snapshot is using pupetter and is only useable by jest

# Installation

## Install the npm package by

`npm i jest-element-style-snapshot --save-dev`

### Add it to the jest ecosystem

If you dont have globalSetup file for jest create one

`globalSetup: '<rootDir>/src/globalSetupIntegrationTests.js',`

### Define globalSetupIntegrationTests.js

Inside `./src/globalSetupIntegrationTests.js`

```
require('expect-puppeteer');

const {
  configureToMatchElementStyleSnapshotFromPage,
} = require('jest-element-style-snapshot');

expect.extend(configureToMatchElementStyleSnapshotFromPage());
```

# How to use

Inside one of your tests you can use the global pupeeteer page object for querying the needed element.

Example:

```
describe("when rendering a button", () => {
    it("should always look the same", () => {
        const page = await browser.newPage();
        await page.goto('https://localhost:3000');
        await page.waitForSelector('#mybutton');
        const element = await page.$('#mybutton');
        await expect(element).toMatchElementStyleSnapshotFromPage(page);
    });
});
```
