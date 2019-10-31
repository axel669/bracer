const terminal = require("@axel669/terminal-tools/terminal")

const getFileName = test => {
    let suite = test.suite
    while (suite.type !== "file") {
        suite = suite.suite
    }

    return suite.fileName
}
const reportResults = result => {
    if (result.type === "test") {
        // console.log(result)
        if (result.failed > 0) {
            const fileName = getFileName(result)
            console.log(`${fileName}: ${result.pathNodes.join("/")}`)
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
module.exports = {
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
}
