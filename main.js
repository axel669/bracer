const topkek = typeof window !== "undefined" ? window : global

topkek.logAll = (title, ...args) => {
    console.log(
        `${title}${"-".repeat(40)}`
            .slice(0, 40)
    )
    for (const arg of args) {
        console.log(arg)
    }
    console.log("-".repeat(40))
}

const terminal = require("@axel669/terminal-tools/terminal/")
const bracer = require("./src/bracer.js")

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
bracer.run(
    [
        "math.test.js",
    ],
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
