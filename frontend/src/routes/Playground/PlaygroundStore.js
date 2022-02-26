import { makeObservable, observable, action, computed, runInAction } from "mobx"
import format from "date-fns/format"

/*const DEFAULT_CODE_VALUE = `\
// Welcome to TankCosc!
// You can write JavaScript source code for your bot in this box then hit "Run" to see what it does!
// See below for a skeleton implementation for a bot that simply waits, scans, rotates, and shoots.

function main() {
    print(\`Health: \${hp}\\tEnergy: \${energy}\`);
    if (energy > 300) {
        scan();  // Uses 200 energy

        print(lastScanResult);
        if (lastScanResult.length > 0) {
            // We picked something up during the scan!
            // Rotate to the first thing we detected and shoot at it
            let target = lastScanResult[0];
            rotate(target.relativeAngle);  // Rotate to point at the enemy
            shoot(100);                    // Shoot with 100 energy
        }
    }
}

// Run the 'main' function forever
while (true) {
    main();
}
`*/

const DEFAULT_CODE_VALUE = `\
// Welcome to TankCosc!
// You can write JavaScript source code for your bot in this box then hit "Run" to see what it does!
// See below for a skeleton implementation for a bot that simply waits, scans, rotates, and shoots.

async function main() {
    print("main loop");
    while (energy > 100) {
        await shoot(100);
        print("shoot");
        await rotate(5);
        print("rotate");
    }
}

// Run the 'main' function forever
while (true) {
    await main();
}
`

export class PlaygroundStore {
    displayLogs = false
    logs = observable.array()
    
    code = DEFAULT_CODE_VALUE

    key = null
    
    worker = null

    constructor(key) {
        makeObservable(this, {
            displayLogs: observable,
            logs: observable,
            code: observable,
            worker: observable,
            onCodeChange: action,
            _logEvent: action,
            _destroyWorker: action,
            toggleLogs: action,
            start: action,
            stop: action,
            isRunning: computed
        })
        this.key = key
    }

    get isRunning() {
        return this.worker !== null
    }

    onCodeChange(value) {
        this.code = value
    }

    _logEvent(message) {
        this.logs.push({
            date: format(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            message: (typeof message === 'string' || message instanceof String) ? message : JSON.stringify(message)
        })
    }

    _destroyWorker() {
        this.worker.terminate()
        this.worker = null
    }

    start() {
        if (this.isRunning) {
            return
        }
        this.logs.clear()
        this.displayLogs = true

        this._logEvent("Began Execution")
        this.worker = new Worker('/static/js/playground_executor_worker.js')

        this.worker.addEventListener('error', (ex) => {
            console.log(ex)
            this._logEvent(`[INTERNAL ERROR] You may want to refresh the page and try again. Error details: ${ex.message} (lineno: ${ex.lineno})`)
            this._destroyWorker()
        })
        this.worker.addEventListener('message', (event) => {
            console.log(event)
            const message = event.data

            if (message.status === "terminated") {
                this._destroyWorker()
            }
            else if (message.status === "done") {
                this._destroyWorker()
            }
            else if (message.status === "error") {
                this._logEvent(`[ERROR] Details: ${message.errorMessage} (lineno: ${message.adjustedLineNumber})`)
                this._destroyWorker()
            }
            else if (message.status === "log") {
                this._logEvent(message.message)
            }
        })

        this.worker.postMessage({
            command: "start",
            code: this.code,
            key: this.key
        })
    }

    stop() {
        if (!this.isRunning) {
            return
        }

        this._logEvent(`Manually terminating execution...`)

        this.worker.postMessage({
            command: "stop"
        })

        setTimeout(() => {
            // Just in case it hangs
            if (this.worker !== null) {
                this._destroyWorker()  
            }
            this._logEvent(`Execution manually terminated.`)
        }, 500)
    }

    toggleLogs() {
        this.displayLogs = !this.displayLogs
    }
}