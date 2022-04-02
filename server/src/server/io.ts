import { PlayerConnection } from "../connection/PlayerConnection"
import { activePlayerConnections, connectionUpdateBuffer, db } from "../game_state"
import { OBSERVER_KEY } from "../global"
import { buildObserverUpdate } from "../tick/update_observers"
import { io } from "./server"

io.on("connection", (socket) => {
    console.log("New socket connection!")
    
    let playerConn: PlayerConnection | null = null

    const setupAsPlayerConnection = () => {
        console.log(socket.data.player)
        playerConn = new PlayerConnection(socket, socket.data.playerId!)
        playerConn.addCommandEventListener(() => {
            connectionUpdateBuffer.push(playerConn)
        })
        
        activePlayerConnections.add(playerConn)
        socket.emit("login_success")
    }

    if (socket.rooms.has("player") && socket.data.player !== undefined) {
        setupAsPlayerConnection()
    }
    else {
        // Determine socket type via login.
        socket.once("login", async (type: string, key: string) => {
            if (type === "observer") {
                if (OBSERVER_KEY === key) {
                    socket.join("observer")
                    socket.emit("login_success")
                    socket.emit("update", ...(await buildObserverUpdate()))
                }
                else {
                    socket.emit("loginError", "Key is invalid.")
                    socket.disconnect()
                }
            }
            else if (type === "player") {
                if (await db.playerExists(key)) {
                    for (const conn of activePlayerConnections) {
                        if (conn.playerId === key) {
                            socket.emit("loginError", "You cannot join using the same key twice.")
                            socket.disconnect()
                            return
                        }
                    }

                    socket.join("player")
                    socket.data.playerId = key
                    socket.data.player = await db.getPlayer(key)
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