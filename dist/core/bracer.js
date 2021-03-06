"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bridge = _interopRequireDefault(require("./bridge.js"));

var _testFunctions = _interopRequireDefault(require("./test-functions.js"));

var _runAll = _interopRequireDefault(require("./run-all.js"));

var _stopwatch = _interopRequireDefault(require("./stopwatch.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getSuitesFromFile = async (testFunc, ...args) => {
  const suites = [];

  const unsub = _bridge.default.subscribe("suite.create", suite => suites.push(suite));

  await testFunc(...args);
  unsub();
  return suites.filter(suite => suite.parent === undefined);
};

const runTests = async (options = {}) => {
  const {
    files,
    loadFile,
    generateRequire,
    makeFunction,
    reporter = {},
    specFilter = () => true,
    stopOnFail = false
  } = options;
  const reporterFuncs = Object.entries(reporter).map(([type, handler]) => _bridge.default.subscribe(type, handler));

  _bridge.default.dispatch("onBracerStart");

  const completedSuites = []; // for (const [shortName, fileName] of files) {

  for (const fileName of files) {
    const shortName = fileName;
    const source = await loadFile(fileName);

    _bridge.default.dispatch("onFileEnter", shortName);

    const testFunc = makeFunction(..._testFunctions.default.names, "require", "__filename", source);
    const suites = await getSuitesFromFile(testFunc, ..._testFunctions.default.args, generateRequire(fileName), fileName);
    const fileSuite = {
      type: "file",
      fileName: shortName,
      results: [],
      suite: null
    };

    for (const suite of suites) {
      if (suite.shouldRun) {
        const spec = {
          name: suite.name,
          suite: fileSuite,
          pathNodes: [suite.name],
          path: suite.name,
          type: "suite",
          env: {}
        };

        if (specFilter(spec) === true) {
          const watch = (0, _stopwatch.default)(true);
          await suite.run(spec, specFilter, [], []);
          watch.stop();
          fileSuite.duration = watch.read();
          fileSuite.results.push(spec);
        }
      }
    }

    completedSuites.push(fileSuite);

    _bridge.default.dispatch("onFileExit", shortName);
  }

  _bridge.default.dispatch("onBracerFinish", completedSuites);

  (0, _runAll.default)(reporterFuncs);
  return completedSuites;
};

var _default = {
  run: runTests
};
exports.default = _default;