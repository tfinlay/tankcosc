/*
 * Entrypoint for the tankcosc CLI.
 */
import {ArgumentParser} from "argparse"
import Logger, {setLogLevel} from "./logger";
import {runCommandHandler} from "./command_handler/run";
import {generateCommandHandler} from "./command_handler/generate";

const main = async () => {
  const parser = new ArgumentParser({
    description: "A CLI program for interfacing with TankCOSC"
  })
  parser.add_argument('-v', '--verbose', {
    help: 'Enable verbose logging.',
    required: false,
    action: 'store_true'
  })
  parser.add_argument('-e', '--echo-commands', {
    help: 'Enable echoing of the commands that are received from your bot to the console. This also enabled verbose logging.',
    required: false,
    action: 'store_true'
  })

  const subparsers = parser.add_subparsers({
    dest: 'subcommand',
    help: "Command to execute.",
    required: true
  })

  const initParser = subparsers.add_parser('generate', {
    description: "Generate a bot based on a language template."
  })
  initParser.add_argument('language', {
    help: 'Language to generate the bot template for.'
  })
  initParser.add_argument('-n', '--name', {
    help: "Name of the bot you want to generate. A new folder with this name will be created with the bot template inside it.",
    required: true
  })

  const runParser = subparsers.add_parser('run', {
    description: "Run your bot."
  })
  runParser.add_argument('-s', '--server', {
    help: "The URL of the game server.",
    required: true
  })
  runParser.add_argument('-k', '--key', {
    help: "The secret key for your account. Used to log in to the game server.",
    required: true
  })
  runParser.add_argument('-c', '--command', {
    help: "Define a command for the CLI to run to start your bot. The process that is started will be able to send/receive commands over stdout/stdin and log to the console over stderr.",
    required: true
  })

  const args = parser.parse_args()

  if (args.verbose) {
    setLogLevel(Logger.level = "debug")
  }
  else if (args.echo_commands) {
    setLogLevel("echo")
  }

  Logger.debug("Received arguments:")
  Logger.debug(args)

  if (args.subcommand === "generate") {
    await generateCommandHandler(args)
  }
  else if (args.subcommand === "run") {
    await runCommandHandler(args)
  }
  else {
    Logger.error("Invalid subcommand.")
    return
  }
}

(async () => {
  try {
    await main()
  }
  catch (e) {
    Logger.error(e)
  }
})()