import express from 'express'
import http from 'http'
import {Server, Socket} from 'socket.io'

export const app = express()
app.use(express.json())

export const server = http.createServer(app)
export const io = new Server(server)