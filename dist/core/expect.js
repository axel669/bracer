"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bridge = _interopRequireDefault(require("./bridge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const nope = f => (...args) => !f(...args);

const equals = (a, b) => {
  if (a !== b) {
    _bridge.default.dispatch("expect.fail", `Expected ${JSON.stringify(a)} === ${JSON.stringify(b)}`);

    return;
  }

  _bridge.default.dispatch("expect.pass");
};

const toBe = (a, b) => {
  if ((a === null || a === void 0 ? void 0 : a.constructor) !== (b === null || b === void 0 ? void 0 : b.constructor)) {
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

var _default = value => {
  const expector = Object.entries(expectations).reduce((ex, info) => {
    const [name, expectation] = info;

    ex[name] = (...args) => {
      const pass = expectation.test(value, ...args);

      if (pass === false) {
        _bridge.default.dispatch("expect.fail", new Error(expectation.message(value, ...args)));

        return expector;
      }

      _bridge.default.dispatch("expect.pass");

      return expector;
    };

    return ex;
  }, {});
  expector.not = Object.entries(expectations).reduce((ex, info) => {
    const [name, expectation] = info;

    ex[name] = (...args) => {
      const pass = !expectation.test(value, ...args);

      if (pass === false) {
        _bridge.default.dispatch("expect.fail", new Error(expectation.message(value, ...args)));

        return expector;
      }

      _bridge.default.dispatch("expect.pass");

      return expector;
    };

    return ex;
  }, {});
  return expector;
};

exports.default = _default;