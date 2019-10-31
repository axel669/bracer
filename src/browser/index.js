import bracer from "@core/bracer.js"

import defaultReporter from "@cli/default-reporter.js"
import defaultSpecFilter from "@cli/default-spec-filter.js"

const loadFile = async url => {
    const response = await fetch(url)

    const sourceCode = await response.text()

    const code = sourceCode.replace(
        /require(\s|\r|\n)*\(([^"]*?)("([^"]+?)")([^"]*?)\)/g,
        (match, _0, _1, lib, name) => {
            return `(await require(${lib}))`
        }
    )

    return code
}
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
const makeFunction = (...args) => new AsyncFunction(...args)

const source = new URL("", location)
const cache = {}
const generateRequire = file => {
    const parent = new URL(file, source)
    return async url => {
        const reqURL = new URL(url, parent).href

        if (cache.hasOwnProperty(reqURL) === false) {
            const code = await loadFile(reqURL)
            const module = {}
            const exports = {}
            const mod = makeFunction(
                "module",
                "exports",
                "__filename",
                code
            )

            module.exports = exports
            mod(module, exports, reqURL.pathname)
            cache[reqURL] = module.exports
        }
        return cache[reqURL]
    }
}

export default (files, options = {}) => {
    const {
        reporter = defaultReporter,
        specFilter = defaultSpecFilter
    } = options
    bracer.run({
        loadFile,
        generateRequire,
        makeFunction,
        files,
        reporter,
        specFilter,
    })
}
