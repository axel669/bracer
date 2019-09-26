#! /usr/bin/env node

import path from "path"

import glob from "fast-glob"
import terminal from "@axel669/terminal-tools/terminal"

import runTests from "@node/index.js"

const files = glob.sync(
    ["**/*.test.js"],
    {
        ignore: "node_modules/**/*",
    }
)

const stuffs = files
    .map(file => [
        file,
        path.resolve(file),
    ])

const reportResults = result => {
    if (result.type === "test") {
        // console.log(result.path)
        if (result.failed > 0) {
            console.log(result.pathNodes.join("/"))
            for (const error of result.errors) {
                console.log(`  ${error.message}`)
            }
        }
        return
    }

    for (const testResult of result.results) {
        reportResults(testResult)
    }
}
runTests(
    stuffs,
    {
        reporter: {
            onFileEnter: filename => {
                terminal(filename)
            },
            onSuiteStart: suite => {
                const pad = "  ".repeat(suite.pathNodes.length)
                terminal(`${pad}${suite.name}`, ["cyan"])
            },
            // onTestStart: test => {
            //     const pad = "  ".repeat(test.pathNodes.length)
            //     terminal(`${pad}[running] ${test.name}`)
            // },
            // onSuiteFinish: suite => {
            //     const pad = "  ".repeat(suite.pathNodes.length)
            //     terminal(`${pad}[done] ${suite.name}`, ["cyan"])
            // },
            onTestFinish: test => {
                const pad = "  ".repeat(test.pathNodes.length)

                if ((test.passed + test.failed) === 0) {
                    terminal(`${pad}[test finished] ${test.name} in ${test.duration}ms`, ["yellow"])
                    return
                }

                if (test.failed > 0) {
                    terminal(`${pad}[test failed] ${test.name}`, ["red"])
                    for (const error of test.errors) {
                        terminal(`${pad}  ${error.message}`, ["red"])
                    }
                    return
                }

                terminal(`${pad}[test passed] ${test.name} in ${test.duration}ms`, ["green"])
            },
            onBracerFinish: (completedSuites) => {
                for (const suite of completedSuites) {
                    reportResults(suite)
                }
                const duration = completedSuites.reduce(
                    (total, {duration}) => total + duration,
                    0
                )
                console.log(`Tests finished in ${duration.toFixed(3)}ms`)
            },
        },
        runFilter: (spec) => {
            console.log(spec)
            return true
        },
    }
)

// console.log(runTests)
