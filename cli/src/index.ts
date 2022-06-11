/*
 * Entrypoint for the tankcosc CLI.
 */
import {ArgumentParser} from "argparse"
import Logger, {setLogLevel} from "./logger";
import {runCommandHandler} from "./command_handler/run";
import {generateCommandHandler} from "./command_handler/generate";
import {BOT_CONFIG_FILE_NAME} from "./bot_config/io";
import {ASSETS_DIR_PATH} from "./util";
import {BotConfigError} from "./error/BotConfigError";
import {BotConfigMissingError} from "./error/BotConfigMissingError";
import {LANGUAGE_GENERATORS} from "./generators/generators";

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

  const listTemplatesParser = subparsers.add_parser("list-langs", {
    description: "Return a list of the languages that this utility can generate bots for."
  })

  const initParser = subparsers.add_parser('generate', {
    description: "Generate a bot based on a language template.",
    aliases: ["create"]
  })
  initParser.add_argument('name', {
    help: "Name of the bot you want to generate. A new folder with this name will be created with the bot template inside it.",
  })
  initParser.add_argument('-l', '--language', {
    help: 'Language to generate the bot template for.',
    required: false
  })
  initParser.add_argument('-s', '--server', {
    help: 'The URL of the game server.',
    required: false
  })
  initParser.add_argument('-k', '--key', {
    help: 'The secret key for your account. Used to log in to the game server.',
    required: false
  })

  const runParser = subparsers.add_parser('run', {
    description: "Run your bot.",
    aliases: ['start']
  })
  runParser.add_argument('name', {
    help: `Name of the bot that you want to run. This is the name of the directory that your bot's ${BOT_CONFIG_FILE_NAME} is located within.`,
    default: '',
    nargs: '?'
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

  Logger.debug(`Using assets path: ${ASSETS_DIR_PATH}`)

  if (["generate", "create"].includes(args.subcommand)) {
    await generateCommandHandler(args)
  }
  else if (["run", "start"].includes(args.subcommand)) {
    try {
      await runCommandHandler(args)
    }
    catch (e) {
      if (e instanceof BotConfigError || e instanceof BotConfigMissingError) {
        Logger.error(`${typeof e}: ${e.message}`, e)
        throw e
      }
      else {
        throw e
      }
    }
  }
  else if (args.subcommand === "list-langs") {
    for (const lang of Object.keys(LANGUAGE_GENERATORS)) {
      console.log(lang)
    }
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
    console.error("An unexpected error has occurred:\n", e)
  }
})()