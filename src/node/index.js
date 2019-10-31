import fs from "fs"
import {Module} from "module"
import path from "path"

import glob from "fast-glob"

import bracer from "@core/bracer.js"

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

const generateRequire = (file) => {
    const mod = new Module(file, module)
    mod.filename = path.resolve(file)
    mod.paths = [
        path.dirname(mod.filename)
    ]
    return (file) => {
        return mod.require(file)
    }
}

const makeFunction = (...args) => new Function(...args)

export default (fileOptions, options) => {
    const {include, ignore = []} = fileOptions
    const files = glob.sync(
        include,
        {
            ignore: [
                "node_modules/**/*",
                ...ignore,
            ]
        }
    )
    return bracer.run({
        ...options,
        files,
        loadFile,
        generateRequire,
        makeFunction,
    })
}
