import express from 'express'
import http from 'http'
import cors from 'cors'
import {Server, Socket} from 'socket.io'

export const app = express()
app.use(express.json())
app.use(cors())

export const server = http.createServer(app)
export const io = new Server(server)