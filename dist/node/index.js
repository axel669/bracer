"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _module = require("module");

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

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
  mod.filename = _path.default.resolve(file);
  mod.paths = [_path.default.dirname(mod.filename)];
  return file => {
    return mod.require(file);
  };
};

const makeFunction = (...args) => new Function(...args);

var _default = (fileOptions, options) => {
  const {
    include,
    ignore = []
  } = fileOptions;

  const files = _fastGlob.default.sync(include, {
    ignore: ["node_modules/**/*", ...ignore]
  });

  return _bracer.default.run({ ...options,
    files,
    loadFile,
    generateRequire,
    makeFunction
  });
};

exports.default = _default;