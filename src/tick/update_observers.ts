/**
 * Observers notification system
 */

import { io } from "../server/server"
import { activePlayerConnections, activeProjectiles, players } from "../game_state"
import { Tank } from "../Tank"

export const buildObserverUpdate = () => {
    const serialisedPlayers = []
    for (const player of players.values()) {
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
        const player = conn.player
        const tank = conn.tank
        serialisedTanks.push({
            colour: player.colour,
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

export const updateObservers = () => {
    io.to("observer").emit("update", ...buildObserverUpdate())
}