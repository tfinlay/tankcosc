import path from "path";
import {AsyncReadline} from "./readline_promises";

export const ASSETS_DIR_PATH = path.join(__dirname, "../assets")

export const queryUserForString = async (prompt: string): Promise<string> => {
  const rl = new AsyncReadline({
    input: process.stdin,
    output: process.stdout
  })

  let url;
  while (!(url = await rl.question(prompt))) {
    // Continue...
  }
  rl.close()

  return url
}