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

const requireOrDefault = (module, def) =>
    (module !== undefined)
        ? localModule.require(module)
        : require(def)

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


const options = {
    reporter: requireOrDefault(reporter, "./default-reporter.js"),
    specFilter: requireOrDefault(specFilter, "./default-spec-filter.js"),
}
const files = {
    include,
    ignore,
}

bracer(files, options)
