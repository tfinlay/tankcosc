import { BulletProjectile } from "../BulletProjectile"
import { DegreeAngle } from "../DegreeAngle"
import { CommandParameterError } from "../error/CommandParameterError"
import { activeProjectiles } from "../game_state"
import { Player } from "../Player"
import { Tank } from "../Tank"
import { Command } from "./command"

/**
 * Command for a rotation with the given number of degrees
 */
export class ShootCommand extends Command {
    readonly energy: number

    constructor(uuid: string, energy: number) {
        super(uuid)

        if (energy < 0) {
            throw new CommandParameterError()
        }

        this.energy = energy
    }

    execute(playerId: string, tank: Tank) {
        const energy = tank.consumeEnergy(this.energy)

        if (energy > 0) {
            const projectile = new BulletProjectile(
                playerId,
                tank.location.copy(),
                energy / 10,
                tank.angle,
                3
            )
            activeProjectiles.add(projectile)
        }
    }
}