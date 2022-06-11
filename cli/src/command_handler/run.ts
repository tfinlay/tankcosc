/**
 * Handler for the `tankcosc run ...` command.
 */
import {HeadlessBotManager} from "../headless_bot_handler/HeadlessBotManager";
import {exec} from "child_process";
import Logger from "../logger";
import {readBotConfig} from "../bot_config/io";

export const runCommandHandler = async (args: any) => {
    Logger.debug(`Parsing bot config in dir: ${args.name}`)
    const config = await readBotConfig(args.name)
    Logger.debug("Loaded bot config:", config)

    Logger.info("🚀 Starting...")
    const manager = new HeadlessBotManager({
        secretKey: config.key,
        serverUrl: config.server,
        startBot: () => {
            return exec(config.command, {
                windowsHide: true,
                cwd: config.cwd
            })
        }
    })

    await manager.run()

    Logger.info("👋 Goodbye.")
}