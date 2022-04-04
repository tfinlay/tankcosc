import { Tank } from "../Tank";

/**
 * A Command instance represents a specific command.
 *
 * Contains a UUID that the client wants to use to identify the response and synchronise with the server.
 */
export abstract class Command {
    uuid: string

    protected constructor(uuid) {
        this.uuid = uuid
    }


    /**
     * Execute the command against the given Tank instance.
     * @param tank to execute the command against
     * @returns a JSON-serialisable object to add to the return to the player
     */
    abstract execute(playerId: string, tank: Tank): object | void
}