import { Socket } from "socket.io";
import { Command } from "../command/command";
import { MoveCommand } from "../command/MoveCommand";
import { RotateCommand } from "../command/RotateCommand";
import { ShootCommand } from "../command/ShootCommand";
import { Player } from "../Player";
import { Tank } from "../Tank";
import { Connection } from "./connection";

/**
 * Handles the lifetime of a socket connections.
 */
export class PlayerConnection extends Connection {
    readonly player: Player
    readonly tank: Tank
    private readonly commandEventListeners = []

    private nextCommand: Command | null = null

    constructor(socket: Socket, player: Player) {
        super(socket)
        this.player = player
        this.tank = Tank.random()

        socket.on("move", this.onMoveCommand.bind(this))
        socket.on("rotate", this.onRotateCommand.bind(this))
        socket.on("shoot", this.onShootCommand.bind(this))
    }

    addCommandEventListener(callback: (command: Command) => void) {
        this.commandEventListeners.push(callback)
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
     * Handles receiving the 'shoot' command
     */
    private onShootCommand(energy: number): void {
        let command: ShootCommand
        try {
            command = new ShootCommand(energy)
        }
        catch (ex) {
            return
        }

        this.queueCommand(command)
    }

    /**
     * Handles receiving the 'rotate' command.
     */
    private onRotateCommand(degrees: number): void {
        let command: RotateCommand
        try {
            command = new RotateCommand(degrees)
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
            this.commandEventListeners.map(callable => callable(command))
            return true
        }
        return false
    }

    private sendResponse(extraResponseFields: object | void): void {
        const data = {
            ...(extraResponseFields ?? {}),
            hp: this.tank.hp,
            energy: this.tank.energy
        }
        //console.table(data)
        this.socket.emit('response', data)
    }

    /**
     * Called every tick. Processes the next command (if any) and pushes an update to the player.
     */
    processCommandAndNotify(): void {
        const extraResponseFields = this.nextCommand?.execute(this.player, this.tank)
        this.nextCommand = null
        this.sendResponse(extraResponseFields)
    }

    dispose(): void {

    }
}