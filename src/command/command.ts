import { Tank } from "../Tank";

/**
 * A Command instance represents a specific command 
 */
export abstract class Command {

    /**
     * Execute the command against the given Tank instance.
     * @param tank to execute the command against
     * @returns a JSON-serialisable object to add to the return to the player
     */
    abstract execute(tank: Tank): any
}