import {LanguageGeneratorFunction} from "./generators";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import {ASSETS_DIR_PATH} from "../util";
import {saveBotConfig} from "../bot_config/io";
import Logger from "../logger";
import {copyAssetFile} from "../asset_fs";

const COMMAND = `python -u ./bot.py`

export const pythonGenerator: LanguageGeneratorFunction = async (targetDir: string, serverUrl: string, key: string) => {
  await fs.mkdir(targetDir)
  await copyAssetFile(path.join(ASSETS_DIR_PATH, "templates", "python", "bot.py"), path.join(targetDir, "bot.py"))
  await saveBotConfig(targetDir, serverUrl, key, COMMAND)

  Logger.info("Your bot now lives in the main() function of bot.py")
}