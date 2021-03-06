import { CommandParameterError } from "../error/CommandParameterError"
import { Player } from "../Player"
import { Tank } from "../Tank"
import { Command } from "./command"

/**
 * Command for a movement in the tank's current direction with the given amount of energy
 */
export class MoveCommand extends Command {
    readonly energy: number

    constructor(uuid: string, energy: number) {
        super(uuid)

        if (energy < 0) {
            throw new CommandParameterError()
        }

        this.energy = energy
    }

    execute(player: string, tank: Tank) {
        const energy = tank.consumeEnergy(this.energy)

        if (energy > 0) {
            tank.move(Math.sqrt(Math.sqrt(energy)))
        }
    }
}