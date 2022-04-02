/*
 * Entrypoint for the tankcosc CLI.
 */
import {ArgumentParser} from "argparse"
import {HeadlessBotManager} from "./headless_bot_handler/HeadlessBotManager";
import {exec} from "child_process";

const main = async () => {
  const parser = new ArgumentParser({
    description: "A CLI program for interfacing with TankCOSC"
  })

  parser.add_argument('serverUrl', {
    help: "The URL of the game server."
  })
  parser.add_argument('secretKey', {
    help: "The secret key for your account. Used to log in to the game server."
  })
  parser.add_argument('-c', '--command', {
    help: "Define a command for the CLI to run to start your bot. The process that is started will be able to send/receive commands over stdout/stdin and log to the console over stderr.",
    required: true
  })

  const args = parser.parse_args()

  console.log("Starting...")

  const manager = new HeadlessBotManager({
    secretKey: args.secretKey,
    serverUrl: args.serverUrl,
    startBot: () => {
      return exec(args.command, {
        windowsHide: true
      })
    }
  })

  await manager.run()

  console.log("Main Completed.")
}

(async () => {
  try {
    await main()
  }
  catch (e) {
    console.error(e)
  }
})()