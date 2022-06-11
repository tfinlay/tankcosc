import {queryUserForString} from "../util";
import Logger from "../logger";
import {BOT_CONFIG_FILE_NAME, saveBotConfig} from "../bot_config/io";
import fs from "fs/promises";
import {LanguageGeneratorFunction} from "./generators";

export const cmdGenerator: LanguageGeneratorFunction = async (targetDir: string, serverUrl: string, key: string) => {
  Logger.info(`Please specify the command to start your bot in the 'command' field of your ${BOT_CONFIG_FILE_NAME} before running.`)

  await fs.mkdir(targetDir)
  await saveBotConfig(targetDir, serverUrl, key, "echo Please specify bot start command here && exit -1")
}