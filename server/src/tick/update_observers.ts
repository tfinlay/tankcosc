/**
 * Observers notification system
 */

import { io } from "../server/server"
import { activePlayerConnections, activeProjectiles, db } from "../game_state"
import { Tank } from "../Tank"

export const buildObserverUpdate = async () => {
    const serialisedPlayers = []
    for (const player of (await db.listPlayers())) {
        serialisedPlayers.push({
            name: player.name,
            colour: player.colour,
            score: player.score
        })
    }
    serialisedPlayers.sort((a, b): number => {
        if (a.score > b.score) {
            return -1
        }
        else if (a.score < b.score) {
            return 1
        }
        return 0
    })

    const serialisedTanks = []
    for (const conn of activePlayerConnections) {
        const tank = conn.tank
        serialisedTanks.push({
            colour: (await db.getPlayer(conn.playerId)).colour,
            x: tank.location.x,
            y: tank.location.y,
            angle: tank.angle.degrees,
            radius: Tank.RADIUS
        })
    }

    const serialisedProjectiles = []
    for (const projectile of activeProjectiles) {
        serialisedProjectiles.push(projectile.serialise())
    }

    return [serialisedPlayers, serialisedTanks, serialisedProjectiles]
}

export const updateObservers = async () => {
    io.to("observer").emit("update", ...(await buildObserverUpdate()))
}