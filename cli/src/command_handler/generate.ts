import path from "path"
import syncFs from "fs"
import {queryUserForString} from "../util";
import {AsyncReadline} from "../readline_promises";
import Logger from "../logger";
import {LANGUAGE_GENERATORS} from "../generators/generators";

export const getLanguages = async (): Promise<string[]> => {
    return Object.keys(LANGUAGE_GENERATORS)
}

const validateLang = async (lang: string) => {
    const validLangs = await getLanguages()
    return validLangs.includes(lang)
}

const executeGenerator = async (lang: string, targetDir: string, serverUrl: string, key: string) => {
    return await LANGUAGE_GENERATORS[lang](targetDir, serverUrl, key)
}

export const generateCommandHandler = async (args: any) => {
    if (!/^[a-zA-Z\d -_]+$/.test(args.name)) {
        Logger.error(`Cannot create bot. Please specify a name that contains only alphabet characters and numbers.`)
        return
    }

    const targetDir = path.resolve(process.cwd(), args.name)

    if (syncFs.existsSync(targetDir)) {
        Logger.error(`Cannot create bot as the target directory already exists: ${targetDir}`)
        return
    }

    const lang = (args.language === undefined) ? await queryUserForLang() : args.language

    if (!(await validateLang(lang))) {
        Logger.error(`No template found for language: ${lang}. Please use the list-langs command to see available language templates.
        If you'd like support to be added in the future, please file or vote on an issue for that language at https://github.com/tfinlay/tankcosc/issues`)
        return
    }

    const serverUrl = args.server ?? await queryUserForString("Game server URL? ")
    const key = args.key ?? await queryUserForString("Secret key? ")

    try {
        await executeGenerator(lang, targetDir, serverUrl, key)
        Logger.info("Bot creation succeeded!")
        Logger.info("To run bot, execute the 'start' command!")
    }
    catch (e) {
        Logger.error("Bot creation failed due to error", e)
    }
}

const queryUserForLang = async (): Promise<string> => {
    console.log("Language templates available:")
    const languages = await getLanguages()
    for (const language of languages) {
        console.log(language)
    }

    const rl = new AsyncReadline({
        input: process.stdin,
        output: process.stdout
    })

    let language;
    while (!languages.includes(language = await rl.question("Which language would you like to use? "))) {
        // Continue...
    }
    rl.close()

    return language
}

