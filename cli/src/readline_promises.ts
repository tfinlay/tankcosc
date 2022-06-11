import readline from "readline";
import type {ReadLine, ReadLineOptions} from "readline";

export class AsyncReadline {
  private readonly rl: ReadLine

  constructor(options: ReadLineOptions) {
    this.rl = readline.createInterface(options)
  }

  question(question: string): Promise<string> {
    return new Promise((res, rej) => {
      this.rl.question(question, res)
    })
  }

  close() {
    this.rl.close()
  }
}