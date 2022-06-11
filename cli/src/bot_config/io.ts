import {BotConfig, BotConfigSchema} from "./BotConfig";
import Yaml from 'yaml';
import fs from "fs/promises";
import {existsSync} from "fs";
import path from "path";
import {BotConfigMissingError} from "../error/BotConfigMissingError";
import {BotConfigError} from "../error/BotConfigError";


const validateAndCompleteConfig = async (config: any, dir: string): Promise<BotConfig> => {
  try {
    await BotConfigSchema.validate(config)
  }
  catch (e) {
    console.error(e)
    throw new BotConfigError(`Failed to load config: ${e.errors}`)
  }

  const validatedConfig: BotConfig = {...config}

  validatedConfig.cwd = path.join(dir, config.cwd ?? ".")

  if (!existsSync(validatedConfig.cwd) || !(await fs.lstat(validatedConfig.cwd)).isDirectory()) {
    throw new BotConfigError(`Invalid CWD. Path does not exist or is not a directory: ${validatedConfig.cwd}`)
  }

  return validatedConfig
}

export const BOT_CONFIG_FILE_NAME = "bot_config.yaml"

/**
 * Reads the bot config for the given bot directory.
 *
 * @param dir to find the config within.
 * @returns BotConfig if a valid one is found.
 * @throws BotConfigMissingError if the config is missing
 */
export const readBotConfig = async (dir: string): Promise<BotConfig> => {
  const filePath = path.join(dir, BOT_CONFIG_FILE_NAME)
  try {
    const text = await fs.readFile(filePath, 'utf-8')
    const rawConfig = Yaml.parse(text)

    return validateAndCompleteConfig(rawConfig, dir)
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      throw new BotConfigMissingError(filePath)
    }
    else {
      throw e
    }
  }
}

export const saveBotConfig = async (dir: string, serverUrl: string, key: string, command: string): Promise<void> => {
  const outFile = path.join(dir, BOT_CONFIG_FILE_NAME)

  const config: Omit<BotConfig, 'cwd'> = {  // CWD is inferred to be the dir of the config file if it is absent.
    server: serverUrl,
    key: key,
    command: command
  }

  const output = Yaml.stringify(config)
  await fs.writeFile(outFile, output)
}