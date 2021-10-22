import express from 'express'
import http from 'http'
import {Server, Socket} from 'socket.io'
import { performance } from 'perf_hooks'
import SourceMapSupport from 'source-map-support'

import {PlayerConnection} from "./connection/PlayerConnection"
import { generatePrivateKey, getRandomIntInclusive } from './global'
import { Player } from './Player'

SourceMapSupport.install()

const app = express()
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server)

// Buffer of connections that require a response during the next tick.
const connectionUpdateBuffer: PlayerConnection[] = []
const activePlayerConnections: Set<PlayerConnection> = new Set()

const OBSERVER_KEY = generatePrivateKey()
const players: Map<string, Player> = new Map()  // Map to players by key
const playerNames: Set<string> = new Set()

io.on("connection", (socket) => {
    console.log("New socket connection!")
    
    let playerConn: PlayerConnection | null = null

    const setupAsPlayerConnection = () => {
        playerConn = new PlayerConnection(socket, socket.data.player!)
        activePlayerConnections.add(playerConn)
    }

    if (socket.rooms.has("player") && socket.data.player !== undefined) {
        setupAsPlayerConnection()
    }
    else {
        // Determine socket type via login.
        socket.once("login", (type: string, key: string) => {
            if (type === "observer") {
                if (OBSERVER_KEY === key) {
                    socket.join("observer")
                    socket.emit("update", ...buildObserverUpdate())
                }
                else {
                    socket.emit("loginError", "Key is invalid.")
                    socket.disconnect()
                }
            }
            else if (type === "player") {
                if (players.has(key)) {
                    socket.join("player")
                    socket.data.player = key
                    setupAsPlayerConnection()
                }
                else {
                    socket.emit("loginError", "Key is invalid.")
                    socket.disconnect()
                }
            }
            else {
                socket.emit("loginError", "Login type is invalid.")
                socket.disconnect()
            }
        })
        socket.emit("requestLogin")
    }

    socket.on("disconnect", () => {
        if (playerConn !== null) {
            activePlayerConnections.delete(playerConn)
            playerConn.dispose()
        }
    })
})

/**
 * Observers notification system
 */

const buildObserverUpdate = () => {
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
            angle: tank.angle.degrees
        })
    }

    return [serialisedPlayers, serialisedTanks]
}

const updateObservers = () => {
    io.to("observer").emit("update", ...buildObserverUpdate())
}

const gameTicker = () => {
    const startTime = performance.now()

    for (const connection of connectionUpdateBuffer) {
        connection.update()
    }

    const doUpdateObservers = connectionUpdateBuffer.length !== 0

    // Clear the buffer.
    connectionUpdateBuffer.splice(0, connectionUpdateBuffer.length);

    if (doUpdateObservers) {
        updateObservers()
    }

    const endTime = performance.now()
    if (endTime - startTime > 20) {
        // Took more than 20ms
        console.warn(`Tick processing time took more than ${endTime-startTime}ms.`)
    }

    setTimeout(gameTicker, 100)
}

/**
 * HTTP Methods
 */

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view.html')
})
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html')
})
app.post('/register', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    const name = req.body.name
    if (typeof name === 'string' && name && !playerNames.has(name)) {
        // Register the player
        const player = new Player(name, "red")
        const key = generatePrivateKey()

        players.set(key, player)
        playerNames.add(name)

        res.end(JSON.stringify({
            name: name,
            colour: player.colour,
            key: key
        }))

        setTimeout(updateObservers, 0)
    }
    else {
        res.status(400)
        res.end(JSON.stringify({
            error: {
                message: "Name is not defined, of incorrect type, or is already in use."    
            }
        }))
    }
})

/**
 * Begin
 */

server.listen(3000, () => {  
    console.log('listening on *:3000')
    console.log(`Observer key is: ${OBSERVER_KEY}`)

    gameTicker()
})