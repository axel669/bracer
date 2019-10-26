"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const takeType = (array, ...types) => array.filter(item => types.indexOf(item.type) !== -1);

var _default = takeType;
exports.default = _default;