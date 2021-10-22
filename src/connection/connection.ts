import { Socket } from "socket.io";

export abstract class Connection {
    private readonly socket: Socket

    constructor(socket: Socket) {
        this.socket = socket
    }

    abstract dispose(): void
}