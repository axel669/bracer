const perf = (typeof window === "undefined")
    ? require("perf_hooks").performance
    : window.performance

const stopwatch = (autoStart = false) => {
    const time = {
        start: null,
        end: null,
    }

    const start = () => {
        if (time.start === null) {
            time.start = perf.now()
        }
    }
    const stop = () => {
        if (time.start !== null && time.end === null) {
            time.end = perf.now()
        }
    }

    const read = () => {
        if (time.start === null) {
            return null
        }

        const end = time.end || perf.now()
        return end - time.start
    }

    if (autoStart === true) {
        start()
    }

    return {
        start,
        stop,
        read,
    }
}

module.exports = stopwatch
