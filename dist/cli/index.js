#! /usr/bin/env node
"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _module = require("module");

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _argParser = _interopRequireDefault(require("@axel669/arg-parser"));

var _bracer = _interopRequireDefault(require("../core/bracer.js"));

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

const generateRequire = file => {
  const mod = new _module.Module(file, module);
  return mod.require;
};

const args = (0, _argParser.default)({
  "ignore:i": list => list.split(",").map(glob => glob.trim()).filter(glob => glob !== "")
});
const {
  _: [include = "**/*.test.js"],
  ignore = []
} = args;
console.log(include, ignore); // const [, , include = "**/*.test.js", ignore = ""] = process.argv
//
// console.log(
//     include,
//     ignore
//         .split(",")
//         .map(glob => glob.trim())
//         .filter(glob => glob !== "")
// )
//

const files = _fastGlob.default.sync(include, {
  ignore: ["node_modules/**/*", ...ignore]
});

console.log(files); //
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