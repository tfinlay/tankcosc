import { PlayerConnection } from "../connection/PlayerConnection"
import { activePlayerConnections, connectionUpdateBuffer, players } from "../game_state"
import { OBSERVER_KEY } from "../global"
import { buildObserverUpdate } from "../tick/update_observers"
import { io } from "./server"

io.on("connection", (socket) => {
    console.log("New socket connection!")
    
    let playerConn: PlayerConnection | null = null

    const setupAsPlayerConnection = () => {
        console.log(socket.data.player)
        playerConn = new PlayerConnection(socket, socket.data.player!)
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
        socket.once("login", (type: string, key: string) => {
            if (type === "observer") {
                if (OBSERVER_KEY === key) {
                    socket.join("observer")
                    socket.emit("login_success")
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
                    socket.data.player = players.get(key)
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