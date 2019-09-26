import fs from "fs"
import {Module} from "module"

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
    return mod.require
}

export default (files, options) => bracer.run({
    files,
    loadFile,
    generateRequire,
    ...options,
})
