const { rm } = require("node:fs/promises");

function cleanPathsPlugin({ patterns }) {
  return {
    name: "clean-paths",
    setup(build) {
      build.onStart(async () => {
        await Promise.all(patterns.map((pattern) => rm(pattern, { recursive: true, force: true })));
      });
    },
  };
}

module.exports = { cleanPathsPlugin };
