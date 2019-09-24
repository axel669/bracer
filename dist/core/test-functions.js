"use strict";

const bridge = require("./bridge.js");

const expect = require("./expect.js");

const takeType = require("./take-type.js");

const runAll = require("./run-all.js");

const stopwatch = require("./stopwatch.js");

const suite = (name, ...tests) => {
  const activeTests = tests.filter(test => test.shouldRun);
  const runnableTests = takeType(activeTests, ["test", "suite"]);
  const setups = takeType(activeTests, ["setup"]);
  const teardowns = takeType(activeTests, ["teardown"]);
  const beforeEach = takeType(activeTests, ["beforeEach"]);
  const afterEach = takeType(activeTests, ["afterEach"]);
  const self = {
    name,
    shouldRun: true,
    type: "suite",
    run: async (spec, specFilter, parentBefore, parentAfter) => {
      bridge.dispatch("onSuiteStart", spec);
      const testList = runnableTests.filter(specFilter);
      spec.results = [];
      await runAll(setups, spec.env);
      const watch = stopwatch(true);

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
        const before = [...parentBefore, ...beforeEach];
        const after = [...parentAfter, ...afterEach];
        await test.run(newSpec, specFilter, before, after);
        spec.results.push(newSpec);
      }

      watch.stop();
      await runAll(teardowns, spec.env);
      spec.duration = watch.read();
      bridge.dispatch("onSuiteFinish", spec);
    }
  };
  tests.forEach(test => test.parent = self);
  bridge.dispatch("suite.create", self);
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
    run: async (spec, _, before, after) => {
      await runAll(before, spec.env);
      const watch = stopwatch(true);
      bridge.dispatch("onTestStart", spec);
      const errors = [];
      let passed = 0;
      const subscriptions = [bridge.subscribe("expect.fail", message => errors.push(message)), bridge.subscribe("expect.pass", () => passed += 1)];
      await testFunc(spec);

      for (const unsub of subscriptions) {
        unsub();
      }

      spec.passed = passed;
      spec.failed = errors.length;
      spec.errors = errors;
      watch.stop();
      spec.duration = watch.read();
      bridge.dispatch("onTestFinish", spec);
      await runAll(after, spec.env);
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

const argFuncs = [["suite", suite], ["setup", setup], ["teardown", teardown], ["test", test], ["beforeEach", beforeEach], ["afterEach", afterEach], ["xsuite", xsuite], ["xsetup", xsetup], ["xteardown", xteardown], ["xtest", xtest], ["xbeforeEach", xbeforeEach], ["xafterEach", xafterEach], ["expect", expect], ["testCases", testCases]];
const argNames = argFuncs.map(arg => arg[0]);
const argValues = argFuncs.map(arg => arg[1]);
module.exports = {
  names: argNames,
  args: argValues
};