import {BotConfigError} from "./BotConfigError";

export class BotConfigMissingError extends BotConfigError {
  constructor(path: string) {
    super(`Failed to find bot config at: ${path}`);

    // Set the prototype explicitly.
    //Object.setPrototypeOf(this, BotConfigMissingError.prototype);
  }
}