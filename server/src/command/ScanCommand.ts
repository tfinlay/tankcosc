import { DegreeAngle } from "../DegreeAngle"
import { activePlayerConnections, db } from "../game_state"
import { Player } from "../Player"
import { Tank } from "../Tank"
import { Command } from "./command"
import sortBy from "lodash/sortBy"
import {CommandParameterError} from "../error/CommandParameterError";
import Config from "../config";

type ScanResponseEnemy = {distance: number, relativeAngle: number, name: string}

interface ScanCommandResponse {
    scan: ScanResponseEnemy[]
}

/**
 * Command to scan the tank's surroundings for enemies.
 */
export class ScanCommand extends Command {
    public static ENERGY = 200

    constructor() {
        super()
    }

    async execute(playerId: string, tank: Tank): Promise<ScanCommandResponse> {
        if (!tank.consumeExactEnergy(ScanCommand.ENERGY)) {
            // They don't have enough energy.
            throw new CommandParameterError(`The scan command requires ${ScanCommand.ENERGY} energy. You don't have enough`);
        }

        const results: ScanResponseEnemy[] = []

        for (const playerConn of activePlayerConnections) {
            if (playerConn.playerId === playerId) {
                continue;
            }

            const dx = playerConn.tank.location.x - tank.location.x
            const dy = playerConn.tank.location.y - tank.location.y

            let angle = DegreeAngle.toDegrees(Math.atan2(
                dy, dx
            ))

            const distance = Math.sqrt(dx*dx + dy*dy)

            const rotation = new DegreeAngle(angle - tank.angle.degrees).degrees
            const rotationFuzziness = (Config.scanUncertainty) ? ((distance*distance) * (1/10000) * (Math.random() - 0.5)) : 0  // Noise increases with the square of the distance
            const rotationReading = ((-0.1 < rotation && rotation < 0.1 ) ? 0 : rotation) + rotationFuzziness

            results.push({
                distance: distance,  // Distance
                relativeAngle: rotationReading, // Rotation
                name: (await db.getPlayer(playerConn.playerId)).name
            })
        }

        return {
            scan: sortBy(results, "distance")
        }
    }
}