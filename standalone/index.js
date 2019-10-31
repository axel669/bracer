var bracer = (function () {
    'use strict';

    const subscriptions = {};
    const bridge = {
      subscribe: (type, handler) => {
        var _subscriptions$type;

        const id = Math.random().toString(36);
        const listener = {
          id,
          dispatch: handler
        };
        const handlers = (_subscriptions$type = subscriptions[type]) !== null && _subscriptions$type !== void 0 ? _subscriptions$type : [];
        subscriptions[type] = [...handlers, listener];
        return () => {
          subscriptions[type] = subscriptions[type].filter(listener => listener.id !== id);
        };
      },
      dispatch: (type, data) => {
        var _subscriptions$type2;

        const listeners = (_subscriptions$type2 = subscriptions[type]) !== null && _subscriptions$type2 !== void 0 ? _subscriptions$type2 : [];

        for (const listener of listeners) {
          listener.dispatch(data, type);
        }
      }
    };

    const toBe = (a, b) => {
      if (a.constructor !== b.constructor) {
        return false;
      }

      switch (true) {
        case a.constructor === RegExp:
          {
            return a.source === b.source && a.flags === b.flags;
          }

        case Array.isArray(a):
          {
            if (a.length !== b.length) {
              return false;
            }

            const aHasDif = a.some((value, index) => value !== b[index]);
            return aHasDif === false;
          }

        case typeof a === "object":
          {
            const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

            for (const key of allKeys) {
              if (toBe(a[key], b[key]) === false) {
                return false;
              }
            }

            return true;
          }
      }

      return a === b;
    };

    const s = JSON.stringify;
    const expectations = {
      toEqual: {
        test: (a, b) => a === b,
        message: (a, b) => `Expected ${s(a)} === ${s(b)}`
      },
      toBe: {
        test: (a, b) => toBe(a, b),
        message: (a, b) => `Expected ${s(a)} to be ${s(b)}`
      },
      toBeGreaterThan: {
        test: (a, b) => a > b,
        message: (a, b) => `Expected ${s(a)} > ${s(b)}`
      },
      toBeLessThan: {
        test: (a, b) => a < b,
        message: (a, b) => `Expected ${s(a)} < ${s(b)}`
      },
      toBeGreaterThanOrEqual: {
        test: (a, b) => a >= b,
        message: (a, b) => `Expected ${s(a)} >= ${s(b)}`
      },
      toBeLessThanOrEqual: {
        test: (a, b) => a <= b,
        message: (a, b) => `Expected ${s(a)} <= ${s(b)}`
      },
      toBeBetween: {
        test: (a, b, c) => a >= Math.min(b, c) && a <= Math.max(b, c),
        message: (a, b, c) => `Expected ${a} to be between ${b} and ${c}`
      },
      toBeNear: {
        test: (value, target, error = target * 0.01) => Math.abs(value - target) <= error,
        message: (value, target, error = target * 0.01) => `Expected ${value} to be near ${target} \u00B1 ${error}`
      },
      toBeNull: {
        test: value => value === null,
        message: value => `Expected ${s(value)} to be null`
      },
      toBeUndefined: {
        test: value => value === undefined,
        message: value => `Expected ${s(value)} to be undefined`
      },
      toBeNegativeInfinity: {
        test: value => false,
        message: value => `Expected ${s(value)} to be -Infinity`
      },
      toThrow: {
        test: func => {
          try {
            func();
          } catch (error) {
            return true;
          }

          return false;
        },
        message: () => "Expected function to throw"
      }
    };
    var expect = (value => {
      const expector = Object.entries(expectations).reduce((ex, info) => {
        const [name, expectation] = info;

        ex[name] = (...args) => {
          const pass = expectation.test(value, ...args);

          if (pass === false) {
            bridge.dispatch("expect.fail", new Error(expectation.message(value, ...args)));
            return expector;
          }

          bridge.dispatch("expect.pass");
          return expector;
        };

        return ex;
      }, {});
      expector.not = Object.entries(expectations).reduce((ex, info) => {
        const [name, expectation] = info;

        ex[name] = (...args) => {
          const pass = !expectation.test(value, ...args);

          if (pass === false) {
            bridge.dispatch("expect.fail", new Error(expectation.message(value, ...args)));
            return expector;
          }

          bridge.dispatch("expect.pass");
          return expector;
        };

        return ex;
      }, {});
      return expector;
    });

    const takeType = (array, ...types) => array.filter(item => types.indexOf(item.type) !== -1);

    const runAll = async (actions, ...args) => {
      for (const action of actions) {
        const f = action.run || action;
        await f(...args);
      }
    };

    const perf = typeof performance === "undefined" ? require("perf_hooks").performance : performance;

    const stopwatch = (autoStart = false) => {
      const time = {
        start: null,
        end: null
      };

      const start = () => {
        if (time.start === null) {
          time.start = perf.now();
        }
      };

      const stop = () => {
        if (time.start !== null && time.end === null) {
          time.end = perf.now();
        }
      };

      const read = () => {
        if (time.start === null) {
          return null;
        }

        const end = time.end || perf.now();
        return end - time.start;
      };

      if (autoStart === true) {
        start();
      }

      return {
        start,
        stop,
        read
      };
    };

    const suite = (name, ...tests) => {
      const activeTests = tests.filter(test => test.shouldRun);
      const runnableTests = takeType(activeTests, "test", "suite");
      const setups = takeType(activeTests, "setup");
      const teardowns = takeType(activeTests, "teardown");
      const beforeEach = takeType(activeTests, "beforeEach");
      const afterEach = takeType(activeTests, "afterEach");
      const self = {
        name,
        shouldRun: true,
        type: "suite",
        run: async (spec, specFilter, parentBefore, parentAfter) => {
          bridge.dispatch("onSuiteStart", spec);
          const testList = runnableTests;
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

            if (specFilter(newSpec) === true) {
              const before = [...parentBefore, ...beforeEach];
              const after = [...parentAfter, ...afterEach];
              await test.run(newSpec, specFilter, before, after);
              spec.results.push(newSpec);
            }
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
        run: async (spec, _0, before, after) => {
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
      expect,
      testCases
    });
    const argNames = argFuncs.map(arg => arg[0]);
    const argValues = argFuncs.map(arg => arg[1]);
    var testFunctions = {
      names: argNames,
      args: argValues
    };

    const getSuitesFromFile = async (testFunc, ...args) => {
      const suites = [];
      const unsub = bridge.subscribe("suite.create", suite => suites.push(suite));
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
      const reporterFuncs = Object.entries(reporter).map(([type, handler]) => bridge.subscribe(type, handler));
      bridge.dispatch("onBracerStart");
      const completedSuites = []; // for (const [shortName, fileName] of files) {

      for (const fileName of files) {
        const shortName = fileName;
        const source = await loadFile(fileName);
        bridge.dispatch("onFileEnter", shortName);
        const testFunc = makeFunction(...testFunctions.names, "require", "__filename", source);
        const suites = await getSuitesFromFile(testFunc, ...testFunctions.args, generateRequire(fileName), fileName);
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
              const watch = stopwatch(true);
              await suite.run(spec, specFilter, [], []);
              watch.stop();
              fileSuite.duration = watch.read();
              fileSuite.results.push(spec);
            }
          }
        }

        completedSuites.push(fileSuite);
        bridge.dispatch("onFileExit", shortName);
      }

      bridge.dispatch("onBracerFinish", completedSuites);
      runAll(reporterFuncs);
      return completedSuites;
    };

    var bracer = {
      run: runTests
    };

    const stylestr = colorNum => `\u001b[${colorNum}m`;

    const logColors = {
      reset: stylestr(0),
      red: stylestr(31),
      green: stylestr(32),
      yellow: stylestr(33),
      cyan: stylestr(36)
    };

    const logColor = (func, message, color = "reset") => {
      const logMessage = `${logColors[color]}${message}${logColors.reset}`;
      console[func](logMessage);
    };

    const getFileName = test => {
      let suite = test.suite;

      while (suite.type !== "file") {
        suite = suite.suite;
      }

      return suite.fileName;
    };

    const reportResults = result => {
      if (result.type === "test") {
        if (result.failed > 0) {
          const fileName = getFileName(result);
          console.group(`${fileName}: ${result.pathNodes.join("/")}`);

          for (const error of result.errors) {
            console.log(error.message);
          }

          console.groupEnd();
        }

        return;
      }

      for (const testResult of result.results) {
        reportResults(testResult);
      }
    };

    var defaultReporter = {
      onFileEnter: filename => {
        logColor("group", filename);
      },
      onSuiteStart: suite => {
        const pad = "  ".repeat(suite.pathNodes.length);
        logColor("group", suite.name, "cyan");
      },
      onTestFinish: test => {
        const pad = "  ".repeat(test.pathNodes.length);
        const {
          name
        } = test;
        const duration = test.duration.toFixed(3);

        if (test.passed + test.failed === 0) {
          logColor("log", `[test finished] ${name} in ${duration}ms`, "yellow");
          return;
        }

        if (test.failed > 0) {
          logColor("groupCollapsed", `[test failed] ${name}`, "red");

          for (const error of test.errors) {
            logColor("log", error.message, "red");
          }

          console.groupEnd();
          return;
        }

        logColor("log", `[test passed] ${name} in ${duration}ms`, "green");
      },
      onSuiteFinish: () => {
        console.groupEnd();
      },
      onFileExit: () => {
        console.groupEnd();
      },
      onBracerFinish: completedSuites => {
        const duration = completedSuites.reduce((total, {
          duration
        }) => total + duration, 0);

        for (const suite of completedSuites) {
          reportResults(suite);
        }

        console.log(`Tests finished in ${duration.toFixed(3)}ms`);
      }
    };

    var defaultSpecFilter = () => true;

    const loadFile = async url => {
      const response = await fetch(url);
      const sourceCode = await response.text();
      const code = sourceCode.replace(/require(\s|\r|\n)*\(([^"]*?)("([^"]+?)")([^"]*?)\)/g, (match, _0, _1, lib, name) => {
        return `(await require(${lib}))`;
      });
      return code;
    };

    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

    const makeFunction = (...args) => new AsyncFunction(...args);

    const source = new URL("", location);
    const cache = {};

    const generateRequire = file => {
      const parent = new URL(file, source);
      return async url => {
        const reqURL = new URL(url, parent).href;

        if (cache.hasOwnProperty(reqURL) === false) {
          const code = await loadFile(reqURL);
          const module = {};
          const exports = {};
          const mod = makeFunction("module", "exports", "__filename", code);
          module.exports = exports;
          mod(module, exports, reqURL.pathname);
          cache[reqURL] = module.exports;
        }

        return cache[reqURL];
      };
    };

    var index = ((files, options = {}) => {
      const {
        reporter = defaultReporter,
        specFilter = defaultSpecFilter
      } = options;
      bracer.run({
        loadFile,
        generateRequire,
        makeFunction,
        files,
        reporter,
        specFilter
      });
    });

    return index;

}());
