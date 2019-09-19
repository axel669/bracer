const testRunner = new Worker("worker.js")
testRunner.addEventListener(
    "message",
    message => {
        const evt = message.data
        console.log(evt)
    }
)
