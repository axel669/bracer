#! /usr/bin/env node

import fs from "fs"
import {Module} from "module"

import glob from "fast-glob"
import argParser from "@axel669/arg-parser"

import bracer from "@node"

const loadFile = async url => {
    if (typeof window !== "undefined") {
        const response = await fetch(url)
        return response.text()
    }

    return new Promise(
        resolve => {
            require("fs").readFile(
                url,
                {encoding: "utf8"},
                (err, data) => resolve(data)
            )
        }
    )
}

const localModule = new Module(
    process.cwd()
)

const requireIfFound = module =>
    (module === undefined)
        ? undefined
        : localModule.require(module)

const args = argParser({
    "ignore:i": list => list
        .split(",")
        .map(glob => glob.trim())
        .filter(glob => glob !== ""),
    "reporter:r": i => i,
    "specFilter:spec-filter|sf": i => i,
})
const {
    _: [include = "**/*.test.js"],
    ignore = [],
    reporter,
    specFilter,
} = args

// console.log(process.cwd())
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
    specFilter: requireIfFound(specFilter),
}
const files = {
    include,
    ignore,
}

// console.log(options)

bracer(files, options)

//
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
