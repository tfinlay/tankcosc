import { DegreeAngle } from "../DegreeAngle"
import { activePlayerConnections } from "../game_state"
import { Player } from "../Player"
import { Tank } from "../Tank"
import { Command } from "./command"
import sortBy from "lodash/sortBy"

type ScanResponseEnemy = {distance: number, relativeAngle: number}

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

        for (const playerConn of activePlayerConnections) {
            if (playerConn.player === player) {
                continue;
            }

            const dx = playerConn.tank.location.x - tank.location.x
            const dy = playerConn.tank.location.y - tank.location.y

            let angle = DegreeAngle.toDegrees(Math.atan2(
                dy, dx
            ))

            const distance = Math.sqrt(dx*dx + dy*dy)

            const rotation = new DegreeAngle(angle - tank.angle.degrees).degrees
            const rotationFuzziness = ((distance*distance) * (1/10000) * (Math.random() - 0.5))  // Noise increases with the square of the distance
            const rotationReading = ((-0.1 < rotation && rotation < 0.1 ) ? 0 : rotation) + rotationFuzziness

            results.push({
                distance: distance,  // Distance
                relativeAngle: rotationReading // Rotation
            })
        }

        return {
            scan: sortBy(results, "distance")
        }
    }
}