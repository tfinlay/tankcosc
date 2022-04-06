import path from "path"
import fs from "fs/promises"

export const getLanguages = async () => {
    return await fs.readdir(path.join(__dirname, "../../templates"))
}

const validateLang = async (lang: string) => {
    const validLangs = await getLanguages()
    return validLangs.includes(lang)
}

export const generateCommandHandler = async (args: any) => {
    const targetDir = path.resolve(process.cwd(), args.name)
    const lang = await validateLang(args.language)
}