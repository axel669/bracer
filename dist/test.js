#! /usr/bin/env node
"use strict";

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _terminal = _interopRequireDefault(require("@axel669/terminal-tools/terminal"));

var _index = _interopRequireDefault(require("./node/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const files = _fastGlob.default.sync(["**/*.test.js"], {
  ignore: "node_modules/**/*"
});

const stuffs = files.map(file => [file, _path.default.resolve(file)]);

const reportResults = result => {
  if (result.type === "test") {
    // console.log(result.path)
    if (result.failed > 0) {
      console.log(result.pathNodes.join("/"));

      for (const error of result.errors) {
        console.log(`  ${error.message}`);
      }
    }

    return;
  }

  for (const testResult of result.results) {
    reportResults(testResult);
  }
};

(0, _index.default)(stuffs, {
  reporter: {
    onFileEnter: filename => {
      (0, _terminal.default)(filename);
    },
    onSuiteStart: suite => {
      const pad = "  ".repeat(suite.pathNodes.length);
      (0, _terminal.default)(`${pad}${suite.name}`, ["cyan"]);
    },
    // onTestStart: test => {
    //     const pad = "  ".repeat(test.pathNodes.length)
    //     terminal(`${pad}[running] ${test.name}`)
    // },
    // onSuiteFinish: suite => {
    //     const pad = "  ".repeat(suite.pathNodes.length)
    //     terminal(`${pad}[done] ${suite.name}`, ["cyan"])
    // },
    onTestFinish: test => {
      const pad = "  ".repeat(test.pathNodes.length);

      if (test.passed + test.failed === 0) {
        (0, _terminal.default)(`${pad}[test finished] ${test.name} in ${test.duration}ms`, ["yellow"]);
        return;
      }

      if (test.failed > 0) {
        (0, _terminal.default)(`${pad}[test failed] ${test.name}`, ["red"]);

        for (const error of test.errors) {
          (0, _terminal.default)(`${pad}  ${error.message}`, ["red"]);
        }

        return;
      }

      (0, _terminal.default)(`${pad}[test passed] ${test.name} in ${test.duration}ms`, ["green"]);
    },
    onBracerFinish: completedSuites => {
      for (const suite of completedSuites) {
        reportResults(suite);
      }

      const duration = completedSuites.reduce((total, {
        duration
      }) => total + duration, 0);
      console.log(`Tests finished in ${duration.toFixed(3)}ms`);
    }
  },
  runFilter: spec => {
    console.log(spec);
    return true;
  }
}); // console.log(runTests)