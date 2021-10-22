import { CommandParameterError } from "../error/CommandParameterError"
import { Tank } from "../Tank"
import { Command } from "./command"

/**
 * Command for a movement in the tank's current direction with the given amount of energy
 */
export class MoveCommand extends Command {
    readonly energy: number

    constructor(energy: number) {
        super()

        if (energy < 0) {
            throw new CommandParameterError()
        }

        this.energy = energy
    }

    execute(tank: Tank) {
        const energy = tank.consumeEnergy(this.energy)

        tank.move(Math.log10(energy) * 4 + 1)
    }
}