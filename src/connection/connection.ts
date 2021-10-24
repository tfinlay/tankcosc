import { Socket } from "socket.io";

export abstract class Connection {
    protected readonly socket: Socket

    constructor(socket: Socket) {
        this.socket = socket
    }

    abstract dispose(): void
}