const {Module} = require("module")
const path = require("path")

const bridge = require("../core/bridge.js")

const testFunctions = require("./test-functions.js")
const runAll = require("./run-all.js")
const stopwatch = require("./stopwatch.js")

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
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

const runTests = async (files, options = {}) => {
    const {
        reporter = {},
        filter = () => true,
    } = options

    const reporterFuncs = Object.entries(reporter)
        .map(
            ([type, handler]) => bridge.subscribe(type, handler)
        )

    bridge.dispatch("onBracerStart")

    const completedSuites = []
    for (const file of files) {
        const source = await loadFile(file)

        bridge.dispatch("onFileEnter", file)

        const testFunc = new Function(
            ...testFunctions.names,
            "require",
            "__filename",
            source,
        )
        const testModule = new Module(file, module)

        const suites = []
        const unsub = bridge.subscribe(
            "suite.create",
            suite => suites.push(suite)
        )
        testFunc(
            ...testFunctions.args,
            testModule.require,
            file
        )
        unsub()

        const topSuites = suites.filter(
            suite => suite.parent === undefined
        )
        const fileSuite = {
            type: "file",
            filename: file,
            results: [],
        }
        for (const suite of topSuites) {
            if (suite.shouldRun) {
                const spec = {
                    name: suite.name,
                    suite: null,
                    pathNodes: [suite.name],
                    path: suite.name,
                    type: "suite",
                    env: {}
                }
                const watch = stopwatch(true)
                await suite.run(spec, filter, [], [])
                watch.stop()
                fileSuite.duration = watch.read()
                fileSuite.results.push(spec)
            }
        }
        completedSuites.push(fileSuite)

        bridge.dispatch("onFileExit", file)
    }
    bridge.dispatch("onBracerFinish", completedSuites)
    runAll(reporterFuncs)

    return completedSuites
}

module.exports = {
    run: runTests,
}
