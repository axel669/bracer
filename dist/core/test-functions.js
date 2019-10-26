"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bridge = _interopRequireDefault(require("./bridge.js"));

var _expect = _interopRequireDefault(require("./expect.js"));

var _takeType = _interopRequireDefault(require("./take-type.js"));

var _runAll = _interopRequireDefault(require("./run-all.js"));

var _stopwatch = _interopRequireDefault(require("./stopwatch.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const suite = (name, ...tests) => {
  const activeTests = tests.filter(test => test.shouldRun);
  const runnableTests = (0, _takeType.default)(activeTests, "test", "suite");
  const setups = (0, _takeType.default)(activeTests, "setup");
  const teardowns = (0, _takeType.default)(activeTests, "teardown");
  const beforeEach = (0, _takeType.default)(activeTests, "beforeEach");
  const afterEach = (0, _takeType.default)(activeTests, "afterEach");
  const self = {
    name,
    shouldRun: true,
    type: "suite",
    run: async (spec, specFilter, parentBefore, parentAfter) => {
      _bridge.default.dispatch("onSuiteStart", spec);

      const testList = runnableTests;
      spec.results = [];
      await (0, _runAll.default)(setups, spec.env);
      const watch = (0, _stopwatch.default)(true);

      for (const test of testList) {
        const pathNodes = [...spec.pathNodes, test.name];
        const newSpec = {
          name: test.name,
          suite: spec,
          env: { ...spec.env
          },
          path: pathNodes.join("."),
          type: test.type,
          pathNodes
        };

        if (specFilter(newSpec) === true) {
          const before = [...parentBefore, ...beforeEach];
          const after = [...parentAfter, ...afterEach];
          await test.run(newSpec, specFilter, before, after);
          spec.results.push(newSpec);
        }
      }

      watch.stop();
      await (0, _runAll.default)(teardowns, spec.env);
      spec.duration = watch.read();

      _bridge.default.dispatch("onSuiteFinish", spec);
    }
  };
  tests.forEach(test => test.parent = self);

  _bridge.default.dispatch("suite.create", self);

  return self;
};

const testCases = (name, cases, testFunc) => suite(name, ...cases.map((testCase, index) => test(`Test Case ${index + 1}`, spec => testFunc(testCase, spec))));

const prepFunc = (type, shouldRun) => action => ({
  name: null,
  run: arg => action(arg),
  shouldRun,
  type
});

const setup = prepFunc("setup", true);
const teardown = prepFunc("teardown", true);
const beforeEach = prepFunc("beforeEach", true);
const afterEach = prepFunc("afterEach", true);
const xsetup = prepFunc("setup", false);
const xteardown = prepFunc("teardown", false);
const xbeforeEach = prepFunc("beforeEach", false);
const xafterEach = prepFunc("afterEach", false);
const xtest = prepFunc("test", false);

const test = (name, testFunc) => {
  return {
    name,
    shouldRun: true,
    type: "test",
    run: async (spec, _0, before, after) => {
      await (0, _runAll.default)(before, spec.env);
      const watch = (0, _stopwatch.default)(true);

      _bridge.default.dispatch("onTestStart", spec);

      const errors = [];
      let passed = 0;
      const subscriptions = [_bridge.default.subscribe("expect.fail", message => errors.push(message)), _bridge.default.subscribe("expect.pass", () => passed += 1)];
      await testFunc(spec);

      for (const unsub of subscriptions) {
        unsub();
      }

      spec.passed = passed;
      spec.failed = errors.length;
      spec.errors = errors;
      watch.stop();
      spec.duration = watch.read();

      _bridge.default.dispatch("onTestFinish", spec);

      await (0, _runAll.default)(after, spec.env);
    }
  };
};

const xsuite = (name, ...tests) => {
  const self = {
    shouldRun: false
  };
  tests.forEach(test => test.parent = self);
  return self;
};

const argFuncs = Object.entries({
  suite,
  setup,
  teardown,
  test,
  beforeEach,
  afterEach,
  xsuite,
  xsetup,
  xteardown,
  xtest,
  xbeforeEach,
  xafterEach,
  expect: _expect.default,
  testCases
});
const argNames = argFuncs.map(arg => arg[0]);
const argValues = argFuncs.map(arg => arg[1]);
var _default = {
  names: argNames,
  args: argValues
};
exports.default = _default;