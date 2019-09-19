const loadFile = (url) => {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", url, false)
    xhr.send(null)

    return xhr.response
}

console.log(
    loadFile("math.js")
)

const bridge = {
    dispatch: (type, data) => {
        postMessage({
            type,
            data,
        })
    }
}

bridge.dispatch("test")
bridge.dispatch("onFileExit", "wat.js")
bridge.dispatch("error", new Error("test"))
bridge.dispatch("objects", {a: [2, 3]})
