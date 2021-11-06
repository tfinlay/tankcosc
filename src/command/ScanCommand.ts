import { DegreeAngle } from "../DegreeAngle"
import { activePlayerConnections } from "../game_state"
import { Player } from "../Player"
import { Tank } from "../Tank"
import { Command } from "./command"

type ScanResponseEnemy = [distance: number, angle: number]

interface ScanCommandResponse {
    scan: ScanResponseEnemy[]
}

/**
 * Command to scan the tank's surroundings for enemies.
 */
export class ScanCommand extends Command {

    constructor() {
        super()
    }

    execute(player: Player, tank: Tank): ScanCommandResponse {
        const results: ScanResponseEnemy[] = []

        for (const player of activePlayerConnections) {
            const dx = tank.location.x - player.tank.location.x
            const dy = tank.location.y - player.tank.location.y

            let angle = 0
            if (dx != 0) {  // anti-divide by zero
                angle = DegreeAngle.toDegrees(Math.atan(
                    dy / dx
                ))
            }

            if (dx > 0) {
                angle += 180
            }
                
            results.push([
                Math.sqrt(dx*dx + dy*dy),
                angle
            ])
        }

        return {
            scan: results
        }
    }
}