import { JSONFile, Low } from "lowdb";
import { Player } from '../../Player'
import {join} from 'path'

type PlayerMap = {[key: string]: Player}

export type DatabaseData = {
    players: PlayerMap
}

export class DatabaseClient {
    protected db: Low<DatabaseData>

    constructor() {
        this.db = null
    }

    get isInitialised() {
        return this.db !== null
    }

    protected async initialise() {
        const filename = join(process.cwd(), 'db.dbjson')
        console.log(`Opening database at path: ${filename}`)
        const adapter = new JSONFile<DatabaseData>(filename)
        const db = new Low<DatabaseData>(adapter)
        
        await db.read()

        // Populate initial data if there isn't any yet
        db.data ||= {
            players: {}
        }

        await db.write()

        this.db = db
    }

    protected async initIfNecessary() {
        if (!this.isInitialised) {
            await this.initialise()
        }
    }

    async getPlayers(): Promise<PlayerMap> {
        await this.initIfNecessary()
        return this.db.data.players
    }

    async setPlayer(playerId: string, player: Player): Promise<void> {
        await this.initIfNecessary()
        this.db.data.players[playerId] = player
        await this.db.write()
    }

    async addToPlayerScore(playerId: string, scoreDelta: number): Promise<void> {
        await this.initIfNecessary()
        const player = this.db.data.players[playerId]

        if (!player) {
            throw new Error("Attempted to add score for player that does not exist")
        }

        player.score += scoreDelta

        await this.setPlayer(playerId, player)
    }

    async playerExists(playerId: string): Promise<boolean> {
        await this.initIfNecessary()
        return !!this.db.data.players[playerId]
    }

    async getPlayer(playerId: string): Promise<Player> {
        await this.initIfNecessary()
        const player = this.db.data.players[playerId]

        if (player) {
            return player
        }

        throw new Error("Attempted to retrieve player that does not exist")
    }

    async listPlayers(): Promise<Player[]> {
        await this.initIfNecessary()
        const players = await this.getPlayers()
        return Object.values(players)
    }

    async getPlayerNames(): Promise<string[]> {
        await this.initIfNecessary()
        return (await this.listPlayers()).map(player => player.name)
    }
}