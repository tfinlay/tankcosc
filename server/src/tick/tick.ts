import { performance } from 'perf_hooks'
import { activePlayerConnections, activeProjectiles, connectionUpdateBuffer, db } from '../game_state'
import { updateObservers } from './update_observers'

const updateProjectiles = () => {
    for (const projectile of activeProjectiles) {
        if (!projectile.tick()) {
            // Delete projectiles that choose to die
            activeProjectiles.delete(projectile)
        }
    }
}

const chargeAndCheckForCollisions = async () => {
    for (const conn of activePlayerConnections) {
        const tank = conn.tank

        // Check for collisions with projectiles
        for (const projectile of activeProjectiles) {
            if (projectile.ownerId !== conn.playerId && projectile.collidingWith(tank)) {
                activeProjectiles.delete(projectile)
                const tankIsDead = conn.handleTankDamage(projectile.calculateDamage(tank))
                if (tankIsDead) {
                    await db.addToPlayerScore(projectile.ownerId, 100)
                }
            }
        }

        // Charge tank (if it wasn't just destroyed)
        if (tank.isAlive) {
            tank.chargeEnergy()
        }

    }
}

const updateAndNotifyTanks = () => {
    for (const conn of activePlayerConnections) {
        conn.processCommandAndNotify()
    }
}

export const runGameTick = async () => {
    const startTime = performance.now()

    // Process commands and send back responses.
    updateAndNotifyTanks()

    // Move shots
    updateProjectiles()

    // Check for collisions and charge tanks
    await chargeAndCheckForCollisions()

    // Clear the buffer.
    connectionUpdateBuffer.splice(0, connectionUpdateBuffer.length);

    await updateObservers()
    

    const endTime = performance.now()
    if (endTime - startTime > 33) {
        // Took more than 20ms
        console.warn(`Tick processing time took more than ${endTime-startTime}ms.`)
    }

    setTimeout(runGameTick, 100)
}