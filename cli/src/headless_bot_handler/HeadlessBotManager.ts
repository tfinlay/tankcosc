import {ChildProcess} from "child_process"
import {io, Socket} from "socket.io-client";
import {BotExecutionManager} from "./BotExecutionManager";
import Logger from "../logger";

interface HeadlessBotHandlerProps {
  startBot: () => ChildProcess,
  serverUrl: string,
  secretKey: string
}
/**
 * Class that manages logging in to the game server and then starting the bot process.
 *
 * The lifecycle is managed by
 */
export class HeadlessBotManager {
  readonly botBuilder: () => ChildProcess
  readonly serverUrl: string
  readonly secretKey: string

  socket: Socket | null = null
  botProcess: ChildProcess | null = null

  executionManager: BotExecutionManager | null = null

  constructor(props: HeadlessBotHandlerProps) {
    this.botBuilder = props.startBot
    this.secretKey = props.secretKey
    this.serverUrl = props.serverUrl
  }

  public async run() {
    const sigintListener = () => {
      Logger.info("Exiting...")
      this.onFinished()
    }
    process.on("SIGINT", sigintListener)

    Logger.info("🔌 Connecting to game server...")
    await this.setupSocket()
    Logger.info("🤖 Spawning bot...")
    await this.runBotProcess()

    Logger.debug("Disconnecting SIGINT handler")

    process.off("SIGINT", sigintListener)
  }

  onFinished() {
    this.botProcess?.kill()
    this.socket?.disconnect()

    Logger.debug("HeadlessBotManager Finished.")
  }

  setupSocket(): Promise<void> {
    return new Promise<void>((res, rej) => {
      this.socket = io(this.serverUrl, {
        reconnectionAttempts: 5
      })
      this.socket.on("connect", () => {
        Logger.info("🌐 Connected to game server.")
      })
      this.socket.on("connect_error", () => {
        Logger.error("Failed to connect to game server.")
        rej("Connection Error")
      })
      this.socket.on("disconnect", () => {
        this.onFinished()
        res()
      })
      this.socket.on("requestLogin", () => {
        Logger.info("🤝 Logging in...")
        this.socket.emit("login", "player", this.secretKey)
      })
      this.socket.on("loginError", (message) => {
        Logger.error(`Login error: ${message}`)
        rej("Login error")
      })
      this.socket.on("login_success", () => {
        Logger.info("🙌 Logged in!")
        res()
      })
    })
  }

  async runBotProcess() {
    try {
      this.botProcess = this.botBuilder()

      await new Promise<void>((res, rej) => {
        try {
          this.executionManager = new BotExecutionManager(this.socket, this.botProcess, () => {
            this.onFinished()
            res()
          })
        }
        catch (e) {
          rej(e)
        }
      })

    }
    catch (e) {
      Logger.error(e)
      this.onFinished()
    }
  }
}