import { Socket } from "socket.io-client"
import {ChildProcess} from "child_process";
import {randomUUID} from "crypto";
import Logger from "../logger";

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

  lastCommandUuid: string | undefined = undefined
  isAwaitingFirstMessage: boolean = true

  constructor(socket: Socket, botProcess: ChildProcess, onFinished: VoidFunction) {
    this.socket = socket
    this.botProcess = botProcess
    this.onFinished = onFinished

    this.subscribeToBotProcess()
    this.subscribeToSocket()
  }

  finish(reason?: string) {
    if (reason) {
      Logger.warn(`Execution finished: ${reason}`)
    }

    this.isFinished = true
    this.onFinished()
  }

  subscribeToBotProcess() {
    this.botProcess.on("disconnect", () => this.finish("Disconnected from bot"))
    this.botProcess.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        Logger.warn("💥 It looks like your bot may have crashed!")
        Logger.warn(`💥 Bot exited with non-zero exit code: ${code}`)
      }
      this.finish("Bot process exited")
    })
    this.botProcess.on("close", () => this.finish("Bot process closed"))
    this.botProcess.on("error", (err) => {
      Logger.error(err)
      this.finish("Bot process errored")
    })
    this.botProcess.on("spawn", () => Logger.info("Bot process spawned"))
    this.botProcess.on("message", (message, sendHandle) => {
      Logger.info(`Received a message from your bot: ${message}`)
    })

    this.botProcess.stderr.pipe(process.stderr)
    this.botProcess.stdout.on("data", (data) => {
      for (const line of data.trim().split("\n")) {
        Logger.log("echo", `< ${line}`)
        this.handleBotCommand(line)
      }
    })
  }

  subscribeToSocket() {
    this.socket.on("disconnect", () => this.finish("Disconnected from server"))

    this.socket.on("response", (data) => this.handleSocketResponse(data))
  }

  handleBotCommand(rawData: string) {
    if (this.lastCommandUuid !== undefined && !this.isAwaitingFirstMessage) {
      Logger.warn("Your bot has sent another command before receiving a response for an earlier command. Are you making sure to wait for a response before sending?")
      return
    }

    const trimmedCommand = rawData.trim()
    const [command, ...args] = trimmedCommand.split(" ")
    const commandUuid = randomUUID()
    this.socket.emit(command.toLowerCase(), commandUuid, ...args.map(parseInt))

    this.lastCommand = trimmedCommand
    this.lastCommandUuid = commandUuid
    this.isAwaitingFirstMessage = false
  }

  handleSocketResponse(data) {
    if (this.isFinished) {
      return
    }

    if (!this.isAwaitingFirstMessage) {
      // UUID checking time
      if (this.lastCommandUuid === undefined) {
        Logger.warn("A server tick has passed in which your bot lodged no command. This can be caused by your bot being too slow or by sending additional commands before receiving a response.")
        return
      }
      else if (this.lastCommandUuid !== data.uuid) {
        Logger.warn("An unexpected message has been received from the game server... Are you making sure to wait for responses before you send messages?")
        return
      }
    }

    this.isAwaitingFirstMessage = false
    this.lastCommandUuid = undefined;

    if (data.error) {
      Logger.error(`Error: ${data.error} (Last Command: ${this.lastCommand ?? "Unknown"})`)
    }

    if (this.botProcess) {
      // Forcefully flush stdin every time.
      this.botProcess.stdin.cork()

      const writeLine = (line: string) => {
        Logger.log("echo", `> ${line}`)
        this.botProcess.stdin.write(`${line}\n`)
      }

      writeLine(`${data.hp} ${data.energy}`)

      if (data.scan !== undefined) {
        for (const line of data.scan) {
          writeLine(`${line.relativeAngle} ${line.distance} ${line.name ?? "undefined"}`)
        }
        writeLine('SCAN END')
      }

      this.botProcess.stdin.uncork()
    }
  }
}