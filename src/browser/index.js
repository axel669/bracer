import bracer from "@core/bracer.js"

const loadFile = async url => {
    const response = await fetch(url)

    return response.text()
}

const loadFileSync = (url) => {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", url, false)
    xhr.send(null)

    return xhr.response
}
const source = new URL("", location)
const cache = {}
const generateRequire = file => {
    const parent = new URL(file, source)
    return url => {
        const reqURL = new URL(url, parent).href

        if (cache.hasOwnProperty(reqURL) === false) {
            const code = loadFileSync(reqURL)
            const module = {}
            const exports = {}
            const mod = new Function("module", "exports", "__filename", code)

            module.exports = exports
            mod(module, exports, reqURL.pathname)
            cache[reqURL] = module.exports
        }
        return cache[reqURL]
    }
}

export default (files, options) => bracer.run({
    loadFile,
    generateRequire,
    files,
    ...options,
})
