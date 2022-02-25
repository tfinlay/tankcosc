/**
 * This is a worker that receives control commands from the PlaygroundStore and in turn controls the user's code execution.
 */
import { io } from "socket.io-client"
import { GAME_SERVER_PATH } from "./config"

const WORKER_SCRIPT_HEADER = `
let hp = -1, energy = -1, lastScanResult = null;

let ___INTERNAL_blockingAwaitingResponse = false;

function ___INTERNAL_blockUntilResponse() {
    while (___INTERNAL_blockingAwaitingResponse) {
        // Yay for busy-looping
        continue;
    }
    return;
}

function move(energy) {
    postMessage({
        command: "move",
        args: [energy]
    });
    ___INTERNAL_blockUntilResponse();
}

function scan(energy) {
    postMessage({
        command: "scan",
        args: []
    });
    ___INTERNAL_blockUntilResponse();
}

function poll(energy) {
    postMessage({
        command: "poll",
        args: []
    });
    ___INTERNAL_blockUntilResponse();
}

function shoot(energy) {
    postMessage({
        command: "shoot",
        args: [energy]
    });
    ___INTERNAL_blockUntilResponse();
}

function rotate(degrees) {
    postMessage({
        command: "rotate",
        args: [degrees]
    });
    ___INTERNAL_blockUntilResponse();
}

// Non-transactional

function print(message) {
    postMessage({
        command: "print",
        message: message
    })
}

onmessage = (evt) => {
    const message = evt.data;
    console.log("SubWorker: Hello!");

    if (message.hasOwnProperty('error')) {
        print(\`[ERROR]: \${message.error}\`)
    }

    hp = message.hp
    energy = message.energy
    lastScanResult = message.scan
}
`
const WORKER_SCRIPT_HEADER_LENGTH = WORKER_SCRIPT_HEADER.length + 4  // see _startWorker() below

class ExecutorWorker {
    worker = null
    socket = null
    isFirstRun = true

    constructor(key, code) {
        this.key = key
        this.code = code
    }

    _constructWorkerScript() {
        return WORKER_SCRIPT_HEADER + this.code
    }

    _handleWorkerCommand(command, args) {
        if (command === "print") {
            postMessage({
                status: "log",
                message: args[0]
            })
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
        const completeCode = header + "\n" + this.code

        const blob = new Blob([completeCode], {type: "application/javascript"})
        this.worker = new Worker(URL.createObjectURL(blob))
        this.worker.addEventListener("error", (ex) => {
            postMessage({
                status: "error",
                error: ex
            })
            this.forceStop()
        })
        this.worker.addEventListener("message", (evt) => {
            const message = evt.message
            this._handleWorkerCommand(message.command, message.args)
        })
    }

    _setupSocket() {
        this.socket = io(GAME_SERVER_PATH)
        this.socket.on("disconnect", () => {
            this.socket = null
        })
        this.socket.on("requestLogin", () => {
            this.socket.emit("login", {player: this.key})
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
                this._startWorker(data)
            }
            else {
                // Notify the worker
                this.worker.postMessage(data)
            }
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
        if (this.worker) {
            this.worker.terminate()
        }

        if (this.socket) {
            this.socket.disconnect()
        }

        postMessage({
            status: "done"
        })
    }
}

let executor = null

onmessage = (evt) => {
    const message = evt.data
    console.log(`Worker: Received command: ${message.command}`)

    if (executor === null) {
        if (message.command === "start") {
            executor = new ExecutorWorker(message.key, message.code)
            executor.start()
        }
        else if (message.command !== "stop") {
            console.error("Worker: Executor is null but received non-start/stop command.")
        }
    }
    else {
        if (message.command === "stop") {
            executor.forceStop()
        }
    }
}