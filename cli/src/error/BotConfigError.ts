export class BotConfigError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    //Object.setPrototypeOf(this, BotConfigError.prototype);
  }
}