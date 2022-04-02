import { Socket } from "socket.io-client"
import {ChildProcess} from "child_process";

/**
 * Class that is given a live bot process and socket to the game server and manages communication
 * between the two. When one or both complete, calls back to its parent.
 */
export class BotExecutionManager {
  readonly socket: Socket
  readonly botProcess: ChildProcess
  readonly onFinished: VoidFunction

  isFinished: boolean = false
  lastCommand: string | null = null

  botIsReadyForResponse: boolean = true

  constructor(socket: Socket, botProcess: ChildProcess, onFinished: VoidFunction) {
    this.socket = socket
    this.botProcess = botProcess
    this.onFinished = onFinished

    this.subscribeToBotProcess()
    this.subscribeToSocket()
  }

  finish(reason?: string) {
    if (reason) {
      console.log(`Finished: ${reason}`)
    }

    this.isFinished = true
    this.onFinished()
  }

  subscribeToBotProcess() {
    this.botProcess.on("disconnect", () => this.finish("Disconnected from bot"))
    this.botProcess.on("exit", () => this.finish("Bot process exited"))
    this.botProcess.on("close", () => this.finish("Bot process closed"))
    this.botProcess.on("error", (err) => {
      console.error(err)
      this.finish("Bot process errored")
    })
    this.botProcess.on("spawn", () => console.log("Bot process spawned"))
    this.botProcess.on("message", (message, sendHandle) => {
      console.log(message)
    })

    this.botProcess.stderr.pipe(process.stderr)
    this.botProcess.stdout.on("data", (data) => this.handleBotCommand(data))
  }

  subscribeToSocket() {
    this.socket.on("disconnect", () => this.finish("Disconnected from server"))

    this.socket.on("response", (data) => this.handleSocketResponse(data))
  }

  handleBotCommand(rawData: string) {
    const trimmedCommand = rawData.trim()
    const [command, ...args] = trimmedCommand.split(" ")
    this.socket.emit(command.toLowerCase(), ...args.map(parseInt))

    this.lastCommand = trimmedCommand
    this.botIsReadyForResponse = true;
  }

  handleSocketResponse(data) {
    if (this.isFinished || !this.botIsReadyForResponse) {
      return
    }

    this.botIsReadyForResponse = false;

    if (data.error) {
      console.error(`Error: ${data.error} (Last Command: ${this.lastCommand ?? "Unknown"})`)
    }

    if (this.botProcess) {
      // Forcefully flush stdin every time.
      console.log(data)

      this.botProcess.stdin.cork()
      this.botProcess.stdin.write(`${data.hp} ${data.energy}\n`)

      if (data.scan !== undefined) {
        for (const line of data.scan) {
          this.botProcess.stdin.write(`${line.relativeAngle} ${line.distance} ${line.name ?? "undefined"}\n`)
        }
        this.botProcess.stdin.write('SCAN END\n')
      }

      this.botProcess.stdin.uncork()
    }
  }
}