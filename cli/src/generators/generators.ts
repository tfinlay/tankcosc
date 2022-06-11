import {cmdGenerator} from "./cmd";
import {pythonGenerator} from "./python";

export type LanguageGeneratorFunction = (targetDir: string, serverUrl: string, key: string) => Promise<void>

export const LANGUAGE_GENERATORS: {[key: string]: LanguageGeneratorFunction} = {
  cmd: cmdGenerator,
  python: pythonGenerator
}