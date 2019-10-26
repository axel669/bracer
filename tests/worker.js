// importScripts(
//     "../standalone/index.js"
// )

const terminal = (() => {
    const stylestr = colorNum => `\u001b[${colorNum}m`
    const styles = {
        reset: stylestr(0),
        black: stylestr(30),
        red: stylestr(31),
        green: stylestr(32),
        yellow: stylestr(33),
        blue: stylestr(34),
        magenta: stylestr(35),
        cyan: stylestr(36),
        white: stylestr(37),
        gray: stylestr(90),
        bgBlack: stylestr(40),
        bgRed: stylestr(41),
        bgGreen: stylestr(42),
        bgYellow: stylestr(43),
        bgBlue: stylestr(44),
        bgMagenta: stylestr(45),
        bgCyan: stylestr(46),
        bgWhite: stylestr(47),
        bold: stylestr(1),
        dim: stylestr(2),
        italic: stylestr(3),
        underline: stylestr(4),
        inverse: stylestr(7),
        hidden: stylestr(8),
        strikethrough: stylestr(9),
    }

    const colorize = (coloration) => {
        const prefix = coloration
            .map(style => styles[style])
            .join("")

        return obj => `${prefix}${obj}${styles.reset}`
    }
    const format = (obj, coloration) => colorize(coloration)(obj)
    const terminal = (obj, coloration = []) =>
        console.log(
            format(obj, coloration)
        )

    terminal.colorize = colorize
    terminal.format = format
    terminal.write = (obj, coloration = []) =>
        process.stdout.write(
            format(obj, coloration)
        )

    return terminal
})()

// const isDefined = value => (
//     value !== null
//     && value !== undefined
// )
// const climb = (source, prop, until) => {
//     let current = source[prop]
//     while (until(current) === false && isDefined(current)) {
//         current = current[prop]
//     }
//
//     return current
// }
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
bracer(
    [
        "math.test.js",
        "dom.test.js",
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
        specFilter: (spec) => {
            // console.log(spec.name, spec.path)
            return true
        },
    }
)
