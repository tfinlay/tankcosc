/**
 * Handler for the `tankcosc run ...` command.
 */
import {HeadlessBotManager} from "../headless_bot_handler/HeadlessBotManager";
import {exec} from "child_process";
import Logger from "../logger";

export const runCommandHandler = async (args: any) => {
    Logger.info("🚀 Starting...")
    const manager = new HeadlessBotManager({
        secretKey: args.key,
        serverUrl: args.server,
        startBot: () => {
            return exec(args.command, {
                windowsHide: true
            })
        }
    })

    await manager.run()

    Logger.info("👋 Goodbye.")
}