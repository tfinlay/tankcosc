import { Socket } from "socket.io";
import { Command } from "./command";

/**
 * Handles the lifetime of a socket connections.
 */
export class Connection {
    private readonly socket: Socket
    private nextCommand: Command | null = null

    constructor(socket: Socket) {
        this.socket = socket
    }

    /**
     * Sets the queued command to be executed in the next tick (if there isn't one already).
     * 
     * @returns true if the command is queued successfully, false if a command is already queued.
     */
    queueCommand(command: Command): boolean {
        if (this.nextCommand === null) {
            this.nextCommand = command
            return true
        }
        return false
    }

    /**
     * Called every tick when an update is scheduled.
     */
    update(): void {


        this.nextCommand = null
    }

    dispose(): void {

    }
}