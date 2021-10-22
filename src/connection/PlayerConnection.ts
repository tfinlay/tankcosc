import { Socket } from "socket.io";
import { Command } from "../command/command";
import { MoveCommand } from "../command/MoveCommand";
import { Player } from "../Player";
import { Tank } from "../Tank";
import { Connection } from "./connection";

/**
 * Handles the lifetime of a socket connections.
 */
export class PlayerConnection extends Connection {
    readonly player: Player
    readonly tank: Tank

    private nextCommand: Command | null = null

    constructor(socket: Socket, player: Player) {
        super(socket)
        this.player = player
        this.tank = Tank.random()

        socket.on("move", this.onMoveCommand.bind(this))
    }

    /**
     * Handles receiving the 'move' command
     */
    private onMoveCommand(energy: number): void {
        let command: MoveCommand
        try {
            command = new MoveCommand(energy)
        }
        catch (ex) {
            return
        }

        this.queueCommand(command)
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