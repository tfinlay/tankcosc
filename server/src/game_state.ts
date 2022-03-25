import { PlayerConnection } from "./connection/PlayerConnection"
import { Player } from "./Player"
import { Projectile } from "./Projectile"
import { DatabaseClient } from "./server/persistence/DatabaseClient"



// Buffer of connections that require a response during the next tick.
export const connectionUpdateBuffer: PlayerConnection[] = []
export const activePlayerConnections: Set<PlayerConnection> = new Set()

export const db = new DatabaseClient()

// Projectiles
export const activeProjectiles: Set<Projectile> = new Set()