/**
 * This is a worker that receives control commands from the PlaygroundStore and in turn controls the user's code execution.
 */
import { io } from "socket.io-client"
import { GAME_SERVER_PATH } from "./config"

const WORKER_SCRIPT_HEADER = `
let hp = -1, energy = -1, lastScanResult = null;

let ___INTERNAL_blockingAwaitingResponse = false;

function callbackOnceDone(callback) {
    setTimeout(() => {
        if (___INTERNAL_blockingAwaitingResponse) {
            callbackOnceDone(callback);
        }
        else {
            callback();
        }
    }, 10)
}

function ___INTERNAL_blockUntilResponse() {
    ___INTERNAL_blockingAwaitingResponse = true;

    return new Promise((resolve, reject) => {
        callbackOnceDone(resolve);
    });
}

function move(energy) {
    postMessage({
        command: "move",
        args: [energy]
    });
    return ___INTERNAL_blockUntilResponse();
}

function scan(energy) {
    postMessage({
        command: "scan",
        args: []
    });
    return ___INTERNAL_blockUntilResponse();
}

function poll(energy) {
    postMessage({
        command: "poll",
        args: []
    });
    return ___INTERNAL_blockUntilResponse();
}

function shoot(energy) {
    postMessage({
        command: "shoot",
        args: [energy]
    });
    return ___INTERNAL_blockUntilResponse();
}

function rotate(degrees) {
    postMessage({
        command: "rotate",
        args: [degrees]
    });
    return ___INTERNAL_blockUntilResponse();
}

// Non-transactional

function print(val) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            postMessage({
                command: "print",
                args: [val]
            });
            res();
        }, 0);
    });
}

onmessage = (evt) => {
    const message = evt.data;
    console.log("SubWorker: Hello!");

    if (message.hasOwnProperty('error') && message.error !== null) {
        print(\`[ERROR]: \${message.error}\`);
        return;
    }

    hp = message.hp;
    energy = message.energy;
    lastScanResult = message.scan ?? lastScanResult;
    ___INTERNAL_blockingAwaitingResponse = false;
}
`
const WORKER_SCRIPT_HEADER_LENGTH = WORKER_SCRIPT_HEADER.split(/\n/g).length + 4  // see _startWorker() below

class ExecutorWorker {
    worker = null
    socket = null
    isFirstRun = true

    logMessageBuffer = []
    logMessageBufferFlushScheduled = false

    constructor(key, code) {
        this.key = key
        this.code = code
    }

    _constructWorkerScript() {
        return WORKER_SCRIPT_HEADER + this.code
    }

    _scheduleLogBufferFlushIfNecessary() {
        if (!this.logMessageBufferFlushScheduled) {
            setTimeout(() => {
                postMessage({
                    status: "log",
                    messages: this.logMessageBuffer
                })
                this.logMessageBuffer.splice(0, this.logMessageBuffer.length)
                this.logMessageBufferFlushScheduled = false
            }, 300)
            this.logMessageBufferFlushScheduled = true
        }
    }

    _handleWorkerCommand(command, args) {
        if (command === "print") {
            this.logMessageBuffer.push(args[0])
            this._scheduleLogBufferFlushIfNecessary()
        }
        else if (command === "finished") {
            this.forceStop()
        }
        else {
            // Socket.IO commands!
            this.socket.emit(command, ...args)
        }
    }

    _startWorker(data) {
        const header = `${WORKER_SCRIPT_HEADER}
        energy = ${data.energy}; hp = ${data.hp}; lastScanResult = [];
        /*
            BEGIN USER CODE
        */`
        const completeCode = header + "\n" + this.code + `
        
        postMessage({
            command: "finished",
            args: []
        });
        self.close();`

        const blob = new Blob([completeCode], {type: "application/javascript"})
        this.worker = new Worker(URL.createObjectURL(blob), {type: "module"})
        this.worker.addEventListener("error", (ex) => {
            postMessage({
                status: "error",
                errorMessage: ex.message,
                adjustedLineNumber: (ex.lineno ?? 0) - WORKER_SCRIPT_HEADER_LENGTH
            })
            this.forceStop()
            console.log(ex)
        })
        this.worker.addEventListener("message", (evt) => {
            const message = evt.data
            console.log(`ExecutorWorker: Received command: ${message.command} ${message.args}`)
            this._handleWorkerCommand(message.command, message.args)
        })
    }

    _setupSocket() {
        this.socket = io(GAME_SERVER_PATH)
        this.socket.on("disconnect", () => {
            this.forceStop();
        })
        this.socket.on("requestLogin", () => {
            this.socket.emit("login", "player", this.key)
        })
        this.socket.on("loginError", (message) => {
            this._log(`Login error: ${message}`)
            this.forceStop()
        })
        this.socket.on("login_success", () => {
            this._log(`Logged in!`)
        })

        this.socket.on("response", (data) => {
            if (this.isFirstRun) {
                // Time to start the worker!
                this.isFirstRun = false
                this._startWorker(data)
            }
            else {
                // Notify the worker
                console.log("Sending response to worker...")
                this.worker.postMessage(data)
            }

            postMessage({
                status: "bot_update",
                hp: data.hp,
                energy: data.energy
            })
        })
    }

    _log(message) {
        console.log(`ExecutorWorker: ${message}`)
        postMessage({
            status: "log",
            message: message
        })
    }

    start() {
        if (this.worker !== null || this.socket !== null) {
            throw new Error("Cannot start a worker/socket that is already running.")
        }

        this._setupSocket()
    }

    forceStop() {
        console.log(`ExecutorWorker: Forcefully terminating`)

        this.worker?.terminate()
        this.socket?.disconnect()

        postMessage({
            status: "terminated"
        })
        console.log(`ExecutorWorker: Sending done`)
        // eslint-disable-next-line no-restricted-globals
        self.close()
    }
}

let executor = null

onmessage = (evt) => {
    const message = evt.data
    console.log(message)
    console.log(`ExecutorWorker: Received command: ${message.command}`)

    if (executor === null) {
        if (message.command === "start") {
            executor = new ExecutorWorker(message.key, message.code)
            executor.start()
        }
        else if (message.command !== "stop") {
            console.error("ExecutorWorker: Executor is null but received non-start/stop command.")
        }
    }
    else {
        if (message.command === "stop") {
            executor.forceStop()
        }
    }
}