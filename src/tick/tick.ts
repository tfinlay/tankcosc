import { performance } from 'perf_hooks'
import { activePlayerConnections, activeProjectiles, connectionUpdateBuffer } from '../game_state'
import { updateObservers } from './update_observers'

const updateProjectiles = () => {
    for (const projectile of activeProjectiles) {
        if (!projectile.tick()) {
            // Delete projectiles that choose to die
            activeProjectiles.delete(projectile)
        }
    }
}

const chargeTanks = () => {
    for (const conn of activePlayerConnections) {
        conn.tank.chargeEnergy()
    }
}

const updateAndNotifyTanks = () => {
    for (const conn of activePlayerConnections) {
        conn.processCommandAndNotify()
    }
}

export const runGameTick = () => {
    const startTime = performance.now()

    // Process commands and send back responses.
    updateAndNotifyTanks()

    // Move shots
    updateProjectiles()

    // TODO: Check for collisions

    // Charge tanks
    chargeTanks()

    // Clear the buffer.
    connectionUpdateBuffer.splice(0, connectionUpdateBuffer.length);

    updateObservers()
    

    const endTime = performance.now()
    if (endTime - startTime > 20) {
        // Took more than 20ms
        console.warn(`Tick processing time took more than ${endTime-startTime}ms.`)
    }

    setTimeout(runGameTick, 100)
}