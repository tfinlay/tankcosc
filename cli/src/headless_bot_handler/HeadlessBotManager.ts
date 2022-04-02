import {ChildProcess} from "child_process"
import {io, Socket} from "socket.io-client";
import {BotExecutionManager} from "./BotExecutionManager";

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
    await this.setupSocket()
    console.log("Spawning bot...")
    await this.spawnBotProcess()
  }

  onFinished() {
    this.botProcess?.kill()
    this.socket?.disconnect()

    console.log("Finished.")
  }

  setupSocket(): Promise<void> {
    return new Promise<void>((res, rej) => {
      this.socket = io(this.serverUrl)
      this.socket.on("disconnect", () => {
        console.log("DISCONNECTED :(")
      })
      this.socket.on("requestLogin", () => {
        console.log("Logging in...")
        this.socket.emit("login", "player", this.secretKey)
      })
      this.socket.on("loginError", (message) => {
        console.log(`Login error: ${message}`)
        rej("Login error")
      })
      this.socket.on("login_success", () => {
        console.log("Logged in!")
        res()
      })
    })
  }

  async spawnBotProcess() {
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
      console.error(e)
      this.onFinished()
    }
  }
}