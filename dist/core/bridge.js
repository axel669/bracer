"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
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
var _default = bridge;
exports.default = _default;