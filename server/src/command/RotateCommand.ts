import { DegreeAngle } from "../DegreeAngle"
import { CommandParameterError } from "../error/CommandParameterError"
import { Player } from "../Player"
import { Tank } from "../Tank"
import { Command } from "./command"

/**
 * Command for a rotation with the given number of degrees
 */
export class RotateCommand extends Command {
    readonly degrees: number

    constructor(degrees: number) {
        super()

        this.degrees = degrees
    }

    execute(player: string, tank: Tank) {
        tank.rotate(new DegreeAngle(this.degrees))
    }
}