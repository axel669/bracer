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
import path from "path"

// const glob = require("fast-glob")
import glob from "fast-glob"

const files = glob.sync(
    ["**/*.test.js"],
    {
        ignore: "node_modules/**/*",
    }
)

console.log(
    files
        .map(file => [
            file,
            path.resolve(file),
        ])
)
