const stylestr = colorNum => `\u001b[${colorNum}m`
const logColors = {
    reset: stylestr(0),
    red: stylestr(31),
    green: stylestr(32),
    yellow: stylestr(33),
    cyan: stylestr(36),
}
const logColor = (func, message, color = "reset") => {
    const logMessage = `${logColors[color]}${message}${logColors.reset}`
    console[func](logMessage)
}

const getFileName = test => {
    let suite = test.suite
    while (suite.type !== "file") {
        suite = suite.suite
    }

    return suite.fileName
}
const reportResults = result => {
    if (result.type === "test") {
        if (result.failed > 0) {
            const fileName = getFileName(result)
            console.group(`${fileName}: ${result.pathNodes.join("/")}`)
            for (const error of result.errors) {
                console.log(error.message)
            }
            console.groupEnd()
        }
        return
    }

    for (const testResult of result.results) {
        reportResults(testResult)
    }
}
module.exports = {
    onFileEnter: filename => {
        logColor("group", filename)
    },
    onSuiteStart: suite => {
        const pad = "  ".repeat(suite.pathNodes.length)
        logColor(
            "group",
            suite.name,
            "cyan"
        )
    },
    onTestFinish: test => {
        const pad = "  ".repeat(test.pathNodes.length)
        const {name} = test
        const duration = test.duration.toFixed(3)

        if ((test.passed + test.failed) === 0) {
            logColor(
                "log"
                `[test finished] ${name} in ${duration}ms`,
                "yellow"
            )
            return
        }

        if (test.failed > 0) {
            logColor(
                "groupCollapsed",
                `[test failed] ${name}`,
                "red"
            )
            for (const error of test.errors) {
                logColor(
                    "log",
                    error.message,
                    "red"
                )
            }
            console.groupEnd()
            return
        }

        logColor(
            "log",
            `[test passed] ${name} in ${duration}ms`,
            "green"
        )
    },
    onSuiteFinish: () => {
        console.groupEnd()
    },
    onFileExit: () => {
        console.groupEnd()
    },
    onBracerFinish: (completedSuites) => {
        const duration = completedSuites.reduce(
            (total, {duration}) => total + duration,
            0
        )

        for (const suite of completedSuites) {
            reportResults(suite)
        }

        console.log(`Tests finished in ${duration.toFixed(3)}ms`)
    },
}
