#! /usr/bin/env node
"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _module = require("module");

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _argParser = _interopRequireDefault(require("@axel669/arg-parser"));

var _node = _interopRequireDefault(require("../node"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const loadFile = async url => {
  if (typeof window !== "undefined") {
    const response = await fetch(url);
    return response.text();
  }

  return new Promise(resolve => {
    require("fs").readFile(url, {
      encoding: "utf8"
    }, (err, data) => resolve(data));
  });
};

const localModule = new _module.Module(process.cwd());

const requireIfFound = module => module === undefined ? undefined : localModule.require(module);

const args = (0, _argParser.default)({
  "ignore:i": list => list.split(",").map(glob => glob.trim()).filter(glob => glob !== ""),
  "reporter:r": i => i,
  "specFilter:spec-filter|sf": i => i
});
const {
  _: [include = "**/*.test.js"],
  ignore = [],
  reporter,
  specFilter
} = args; // console.log(process.cwd())
// console.log(
//     require.paths
// )
//
// const files = glob.sync(
//     include,
//     {
//         ignore: [
//             "node_modules/**/*",
//             ...ignore,
//         ]
//     }
// )

const options = {
  reporter: requireIfFound(reporter),
  specFilter: requireIfFound(specFilter)
};
const files = {
  include,
  ignore
}; // console.log(options)

(0, _node.default)(files, options); //
// bracer.run({
//     files,
//     loadFile,
//     generateRequire,
// })
// export default (fileOptions, options) => {
//     const {include, ignore = []} = fileOptions
//     const files = glob.sync(
//         include,
//         {
//             ignore: [
//                 "node_modules/**/*",
//                 ...ignore,
//             ]
//         }
//     )
//     return bracer.run({
//         files,
//         loadFile,
//         generateRequire,
//         ...options,
//     })
// }