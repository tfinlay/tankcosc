import {LanguageGeneratorFunction} from "./generators";
import fs from "fs/promises";
import path from "path";
import {ASSETS_DIR_PATH} from "../util";
import {BOT_CONFIG_FILE_NAME, saveBotConfig} from "../bot_config/io";
import Logger from "../logger";
import {copyAssetFile} from "../asset_fs";

export const cppGenerator: LanguageGeneratorFunction = async (targetDir: string, serverUrl: string, key: string) => {
  await fs.mkdir(targetDir)
  await copyAssetFile(path.join(ASSETS_DIR_PATH, "templates", "cpp", "bot.cpp"), path.join(targetDir, "bot.cpp"))
  await saveBotConfig(targetDir, serverUrl, key, "echo Please specify bot start command here && exit -1")

  Logger.info("Your bot now lives in the botMain() function of bot.cpp")
  Logger.info(`Please specify the command to start your bot in the 'command' field of your ${BOT_CONFIG_FILE_NAME} before running.`)
}
