const kebabCase = require("lodash.kebabcase");
const path = require("path");
const fsExtra = require("fs-extra");
const mkdirp = require("mkdirp");
const jsonDiff = require("json-diff");

const SNAPSHOTS_DIR = "__html_snapshots__";
const timesCalled = new Map();

async function getElementSnapshot(element, page) {
  const { style, attributes, tagName } = await page.evaluate((e) => {
    // creating an empty dummy object to compare with
    var dummy = document.createElement("element-" + new Date().getTime());
    document.body.appendChild(dummy);

    // getting computed styles for both elements
    var defaultStyles = getComputedStyle(dummy);
    var elementStyles = getComputedStyle(e);

    // calculating the difference
    var diff = {};
    for (var key in elementStyles) {
      if (
        elementStyles.hasOwnProperty(key) &&
        defaultStyles[key] !== elementStyles[key]
      ) {
        diff[key] = elementStyles[key];
      }
    }

    dummy.remove();

    var attributeNames = e.getAttributeNames();
    var attributes = {};
    for (var i = 0; i < attributeNames.length; i++) {
      attributes[attributeNames[i]] = e.getAttribute(attributeNames[i]);
    }

    delete attributes.style;

    return { style: diff, attributes, tagName: e.tagName.toLowerCase() };
  }, element);

  return { attributes, style, tagName };
}

async function walkElement(element, page, subElementsSnapshot) {
  const subElements = await element.$$(":scope > *");
  console.log(subElements.length);
  for (const subElement of subElements) {
    const _subElementsSnapshot = [];
    subElementsSnapshot.push({
      element: await getElementSnapshot(subElement, page),
      subElements: _subElementsSnapshot,
    });

    await walkElement(subElement, page, _subElementsSnapshot);
  }
}

function createSnapshotIdentifier({ retryTimes, testPath, currentTestName }) {
  const defaultIdentifier = kebabCase(
    `${path.basename(testPath)}-${currentTestName}`
  );

  let snapshotIdentifier = defaultIdentifier;

  if (retryTimes) {
    timesCalled.set(
      snapshotIdentifier,
      (timesCalled.get(snapshotIdentifier) || 0) + 1
    );
  }

  return snapshotIdentifier;
}

export function configureToMatchElementStyleSnapshotFromPage() {
  return {
    async toMatchElementStyleSnapshotFromPage(element, page) {
      const { testPath, currentTestName, isNot, snapshotState } = this;
      const retryTimes = parseInt(global[Symbol.for("RETRY_TIMES")], 10) || 0;

      const subElementsSnapshot = [];
      var elementTree = {
        element: await getElementSnapshot(element, page),
        subElements: subElementsSnapshot,
      };
      await walkElement(element, page, subElementsSnapshot);

      const snapshotsDir = path.join(path.dirname(testPath), SNAPSHOTS_DIR);

      const snapshotIdentifier = createSnapshotIdentifier({
        retryTimes,
        testPath,
        currentTestName,
      });

      const snapshotPath = path.join(
        snapshotsDir,
        snapshotIdentifier + ".snapshot"
      );

      if (
        snapshotState._updateSnapshot === "none" &&
        !fsExtra.pathExistsSync(snapshotPath)
      ) {
        return {
          pass: false,
          message: () =>
            `New snapshot was not written. The update flag must be explicitly ` +
            "passed to write a new snapshot.\n\n + This is likely because this test is run in a continuous " +
            "integration (CI) environment in which snapshots are not written by default.\n\n",
        };
      }

      if (!fsExtra.pathExistsSync(snapshotPath)) {
        mkdirp.sync(snapshotsDir);

        await fsExtra.writeJson(snapshotPath, elementTree);
      }

      const currentSnapshot = await fsExtra.readJson(snapshotPath, "utf8");

      // console.log(currentSnapshot);
      // console.log(elementTree);
      console.log("test");

      const diff = jsonDiff.diffString(currentSnapshot, elementTree);

      if (!diff) {
        return {
          pass: true,
          message: () => "",
        };
      } else if (snapshotState._updateSnapshot === "all") {
        await fsExtra.writeJson(snapshotPath, elementTree);
        return {
          pass: true,
          message: () => "",
        };
      }

      snapshotState.fail();

      return {
        pass: false,
        message: () => "HTML Snapshot does not match: \n\n" + diff,
      };
    },
  };
}
