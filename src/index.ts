import express from 'express'
import http from 'http'
import {Server, Socket} from 'socket.io'

import {Connection} from "./connection"

const app = express()
const server = http.createServer(app)
const io = new Server(server)

// Buffer of connections that require a response during the next tick.
const connectionUpdateBuffer: Connection[] = []

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
io.on("connection", (socket) => {
    console.log("New socket connection!")
    
    const connectionObject = new Connection(socket);

    socket.on("disconnect", () => {
        connectionObject.dispose()
    })
})

const gameTicker = () => {
    const startTime = performance.now()

    for (const connection of connectionUpdateBuffer) {
        connection.update()
    }
    // Clear the buffer.
    connectionUpdateBuffer.splice(0, connectionUpdateBuffer.length);

    const endTime = performance.now()
    if (endTime - startTime > 20) {
        // Took more than 20ms
        console.warn(`Tick processing time took more than ${endTime-startTime}ms.`)
    }

    setTimeout(gameTicker, 100)
}

server.listen(3000, () => {  
    console.log('listening on *:3000')
})