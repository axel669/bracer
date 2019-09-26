import path from "path"

import bridge from "@core/bridge.js"

import testFunctions from "@core/test-functions.js"
import runAll from "@core/run-all.js"
import stopwatch from "@core/stopwatch.js"

const getSuitesFromFile = (testFunc, ...args) => {
    const suites = []
    const unsub = bridge.subscribe(
        "suite.create",
        suite => suites.push(suite)
    )
    testFunc(...args)
    unsub()

    return suites.filter(
        suite => suite.parent === undefined
    )
}

const runTests = async (options = {}) => {
    const {
        files,
        loadFile,
        generateRequire,
        reporter = {},
        filter = () => true,
    } = options

    const reporterFuncs = Object.entries(reporter)
        .map(
            ([type, handler]) => bridge.subscribe(type, handler)
        )

    bridge.dispatch("onBracerStart")

    const completedSuites = []
    for (const [shortName, fileName] of files) {
        const source = await loadFile(fileName)

        bridge.dispatch("onFileEnter", shortName)

        const testFunc = new Function(
            ...testFunctions.names,
            "require",
            "__filename",
            source,
        )

        const suites = getSuitesFromFile(
            testFunc,
            ...testFunctions.args,
            generateRequire(fileName),
            fileName
        )

        const fileSuite = {
            type: "file",
            filename: shortName,
            results: [],
        }
        for (const suite of suites) {
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

        bridge.dispatch("onFileExit", shortName)
    }
    bridge.dispatch("onBracerFinish", completedSuites)
    runAll(reporterFuncs)

    return completedSuites
}

export default {
    run: runTests,
}
