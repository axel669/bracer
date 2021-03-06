import bridge from "@core/bridge.js"

import testFunctions from "@core/test-functions.js"
import runAll from "@core/run-all.js"
import stopwatch from "@core/stopwatch.js"

const getSuitesFromFile = async (testFunc, ...args) => {
    const suites = []
    const unsub = bridge.subscribe(
        "suite.create",
        suite => suites.push(suite)
    )
    await testFunc(...args)
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
        makeFunction,
        reporter = {},
        specFilter = () => true,
        stopOnFail = false,
    } = options

    const reporterFuncs = Object.entries(reporter)
        .map(
            ([type, handler]) => bridge.subscribe(type, handler)
        )

    bridge.dispatch("onBracerStart")

    const completedSuites = []
    // for (const [shortName, fileName] of files) {
    for (const fileName of files) {
        const shortName = fileName
        const source = await loadFile(fileName)

        bridge.dispatch("onFileEnter", shortName)

        const testFunc = makeFunction(
            ...testFunctions.names,
            "require",
            "__filename",
            source,
        )

        const suites = await getSuitesFromFile(
            testFunc,
            ...testFunctions.args,
            generateRequire(fileName),
            fileName
        )

        const fileSuite = {
            type: "file",
            fileName: shortName,
            results: [],
            suite: null,
        }
        for (const suite of suites) {
            if (suite.shouldRun) {
                const spec = {
                    name: suite.name,
                    suite: fileSuite,
                    pathNodes: [suite.name],
                    path: suite.name,
                    type: "suite",
                    env: {},
                }
                if (specFilter(spec) === true) {
                    const watch = stopwatch(true)
                    await suite.run(spec, specFilter, [], [])
                    watch.stop()
                    fileSuite.duration = watch.read()
                    fileSuite.results.push(spec)
                }
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
