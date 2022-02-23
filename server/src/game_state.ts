import { PlayerConnection } from "./connection/PlayerConnection"
import { Player } from "./Player"
import { Projectile } from "./Projectile"



// Buffer of connections that require a response during the next tick.
export const connectionUpdateBuffer: PlayerConnection[] = []
export const activePlayerConnections: Set<PlayerConnection> = new Set()

export const players: Map<string, Player> = new Map()  // Map to players by key
export const playerNames: Set<string> = new Set()

// Projectiles
export const activeProjectiles: Set<Projectile> = new Set()