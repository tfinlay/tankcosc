import { makeObservable, observable, action, computed, runInAction } from "mobx"
import format from "date-fns/format"

const DEFAULT_CODE_VALUE = `\
// Welcome to TankCosc!
// You can write JavaScript source code for your bot in this box then hit "Run" to see what it does!
// See below for a skeleton implementation for a bot that simply waits, scans, rotates, and shoots.

async function main() {
    await print(\`Health: \${hp}\\tEnergy: \${energy}\`);
    if (energy > 300) {
        await scan();  // Uses 200 energy

        await print(lastScanResult);
        if (lastScanResult.length > 0) {
            // We picked something up during the scan!
            // Rotate to the first thing we detected and shoot at it
            let target = lastScanResult[0];
            await print(\`Targeting enemy player: \${target.name}!\`);
            await rotate(target.relativeAngle);  // Rotate to point at the enemy
            await shoot(100);                    // Shoot with 100 energy
        }
    }
    else {
        await wait();
    }
}

// Run the 'main' function forever
while (true) {
    await main();
}
`

export class PlaygroundStore {
    static DEFAULT_FILE_NAME = "default.js"

    filePickerOpen = false

    displaySidePanel = false
    sidePanelTab = 'docs'

    logs = observable.array()
    nextLogId = 0
    
    code = DEFAULT_CODE_VALUE
    currentFileName = PlaygroundStore.DEFAULT_FILE_NAME
    fileNames = observable.array()

    key = null
    worker = null
    botHp = null
    botEnergy = null

    constructor(key) {
        makeObservable(this, {
            filePickerOpen: observable,
            displaySidePanel: observable,
            sidePanelTab: observable,
            logs: observable,
            code: observable,
            currentFileName: observable,
            worker: observable,
            fileNames: observable,
            botHp: observable,
            botEnergy: observable,
            setFilePickerOpen: action,
            onCodeChange: action,
            _logEvent: action,
            _destroyWorker: action,
            toggleSidePanel: action,
            start: action,
            stop: action,
            isRunning: computed,
            hasBotStats: computed,
            setSidePanelTab: action,

            createFile: action,
            renameFile: action,
            openFile: action,
            saveToCurrentFile: action,
            reloadAvailableFiles: action
        })
        this.key = key

        runInAction(() => {
            if (!this.checkFileExistence(PlaygroundStore.DEFAULT_FILE_NAME)) {
                this.createFile(PlaygroundStore.DEFAULT_FILE_NAME)
            }
            this.reloadAvailableFiles()
            this.openFile(PlaygroundStore.DEFAULT_FILE_NAME)    
        })
    }

    get hasBotStats() {
        return this.botHp !== null
    }

    get isRunning() {
        return this.worker !== null
    }

    #getStorageIdForFilename(filename) {
        return `saveFile_${filename}`
    }

    setFilePickerOpen(open) {
        this.filePickerOpen = open
    }

    reloadAvailableFiles() {
        this.fileNames.clear()
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith("saveFile_")) {
                this.fileNames.push(key.substring("saveFile_".length))
            }
        }
        this.fileNames.sort()
    }

    checkFileExistence(filename) {
        return this.#getStorageIdForFilename(filename) in localStorage
    }

    createFile(filename) {
        if (this.checkFileExistence(filename)) {
            throw new Error("Cannot create a new file with the same name as an existing one")
        }

        localStorage.setItem(this.#getStorageIdForFilename(filename), DEFAULT_CODE_VALUE)
        this.reloadAvailableFiles()
    }

    deleteFile(filename) {
        if (!this.checkFileExistence(filename)) {
            throw new Error("Cannot delete a file that does not exist")
        }
        localStorage.removeItem(this.#getStorageIdForFilename(filename))
        this.reloadAvailableFiles()
    }

    renameFile(filename, newFilename) {
        if (!this.checkFileExistence(filename)) {
            throw new Error("Cannot rename a file that does not exist")
        }

        if (this.checkFileExistence(newFileId)) {
            throw new Error("Cannot rename a file to the same name as an existing file")
        }

        const newFileId = this.#getStorageIdForFilename(newFilename)
        const oldFileId = this.#getStorageIdForFilename(filename)

        localStorage.setItem(newFileId, localStorage.getItem(oldFileId))
        localStorage.removeItem(oldFileId)

        if (this.currentFileName === filename) {
            this.currentFileName = newFilename
        }
        this.reloadAvailableFiles()
    }

    openFile(filename) {
        if (!this.checkFileExistence(filename)) {
            throw new Error("Cannot open a file that does not exist")
        }

        this.currentFileName = filename
        this.code = localStorage.getItem(this.#getStorageIdForFilename(filename))
    }

    saveToCurrentFile() {
        localStorage.setItem(this.#getStorageIdForFilename(this.currentFileName), this.code)
    }

    onCodeChange(value) {
        this.code = value
        this.saveToCurrentFile();
    }

    _logEvent(message) {
        this.logs.push({
            date: format(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            message: (typeof message === 'string' || message instanceof String) ? message : JSON.stringify(message),
            id: this.nextLogId++
        })

        // Keep log length down
        if (this.logs.length >= 500) {
            this.logs.splice(0, 250)
        }

        this.nextLogId %= 500
    }

    _destroyWorker() {
        this.worker?.terminate()
        this.worker = null

        this.botHp = null
        this.botEnergy = null
    }

    start() {
        if (this.isRunning) {
            return
        }
        this.logs.clear()
        this.displaySidePanel = true
        this.sidePanelTab = 'logs'

        this._logEvent("🚀 Starting...")
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
                if (message.message) {
                    // Only a single message
                    this._logEvent(message.message)
                }
                else {
                    // Multiple messages
                    runInAction(() => {
                        for (const logMessage of message.messages) {
                            this._logEvent(logMessage)
                        }
                    })
                }
            }
            else if (message.status === "bot_update") {
                runInAction(() => {
                    this.botHp = message.hp
                    this.botEnergy = message.energy    
                })
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

        setTimeout(() => {
            // Just in case it hangs
            if (this.worker !== null) {
                console.log(`Hang check destroying worker...`)
                this._destroyWorker()  
            }
            this._logEvent(`Execution manually terminated.`)
        }, 500)

        this.worker.postMessage({
            command: "stop"
        })
    }

    toggleSidePanel() {
        this.displaySidePanel = !this.displaySidePanel
    }

    setSidePanelTab(newValue) {
        this.sidePanelTab = newValue
    }

    dispose() {
        this.stop();
    }
}