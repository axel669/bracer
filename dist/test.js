#! /usr/bin/env node
// const {Module} = require("module")
// const path = require("path")
//
// const wat = new Module("Bracer Tests", module)
// wat.paths = module.paths
// wat.filename = path.resolve("./src/bracer-test")
//
// global.wat = 100
// console.log(wat.require("../math.js"))
// delete global.wat
// const path = require("path")
"use strict";

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const glob = require("fast-glob")
const files = _fastGlob.default.sync(["**/*.test.js"], {
  ignore: "node_modules/**/*"
});

console.log(files.map(file => [file, _path.default.resolve(file)]));