onmessage = (evt) => {
    const message = evt.data
    console.log(`Worker: Received command: ${message.command}`)

    try {
        switch (message.command) {
            case "start":
                console.log("Worker: Starting with code:\n" + message.code)
                eval(message.code)
                break
            case "stop":
                console.log("Worker: Stopping...")
                break
        }
    }
    catch (ex) {
        console.log(`Worker: Caught error: ${ex.message}`)
        postMessage({
            status: "error",
            error: ex
        })
    }
    finally {
        console.log("Worker: Cleaning up...")
        postMessage({
            status: "done"
        })
    }
}