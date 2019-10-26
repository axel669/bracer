"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const runAll = async (actions, ...args) => {
  for (const action of actions) {
    const f = action.run || action;
    await f(...args);
  }
};

var _default = runAll;
exports.default = _default;