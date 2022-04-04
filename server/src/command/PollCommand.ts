import { Player } from "../Player"
import { Tank } from "../Tank"
import { Command } from "./command"


/**
 * Empty command used for polling purposes
 */
export class PollCommand extends Command {

    constructor(uuid: string) {
        super(uuid)
    }

    execute(player: string, tank: Tank) {
        
    }
}