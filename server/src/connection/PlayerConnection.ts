import { Socket } from "socket.io";
import { Command } from "../command/command";
import { MoveCommand } from "../command/MoveCommand";
import { PollCommand } from "../command/PollCommand";
import { RotateCommand } from "../command/RotateCommand";
import { ScanCommand } from "../command/ScanCommand";
import { ShootCommand } from "../command/ShootCommand";
import { CommandParameterError } from "../error/CommandParameterError";
import { Player } from "../Player";
import { Tank } from "../Tank";
import { Connection } from "./connection";
import {HealCommand} from "../command/HealCommand";

/**
 * Handles the lifetime of a socket connections.
 */
export class PlayerConnection extends Connection {
    readonly playerId: string
    readonly tank: Tank
    private readonly commandEventListeners = []

    private nextCommand: Command | null = null

    constructor(socket: Socket, playerId: string) {
        super(socket)
        this.playerId = playerId
        this.tank = Tank.random()

        socket.on("move", this.onMoveCommand.bind(this))
        socket.on("rotate", this.onRotateCommand.bind(this))
        socket.on("shoot", this.onShootCommand.bind(this))
        socket.on("scan", this.onScanCommand.bind(this))
        socket.on("poll", this.onPollCommand.bind(this))
        socket.on("heal", this.onHealCommand.bind(this))
    }

    addCommandEventListener(callback: (command: Command) => void) {
        this.commandEventListeners.push(callback)
    }

    /**
     * Handles receiving the 'move' command
     */
    private onMoveCommand(uuid: string, energy: number): void {
        let command: MoveCommand
        try {
            command = new MoveCommand(uuid, energy)
        }
        catch (ex) {
            return
        }

        this.queueCommand(command)
    }

    /**
     * Handles receiving the 'shoot' command
     */
    private onShootCommand(uuid: string, energy: number): void {
        let command: ShootCommand
        try {
            command = new ShootCommand(uuid, energy)
        }
        catch (ex) {
            return
        }

        this.queueCommand(command)
    }

    /**
     * Handles receiving the 'rotate' command.
     */
    private onRotateCommand(uuid: string, degrees: number): void {
        let command: RotateCommand
        try {
            command = new RotateCommand(uuid, degrees)
        }
        catch (ex) {
            return
        }

        this.queueCommand(command)
    }

    /**
     * Handles receiving the 'scan' command.
     */
    private onScanCommand(uuid: string): void {
        let command: ScanCommand
        try {
            command = new ScanCommand(uuid)
        }
        catch (ex) {
            return
        }

        this.queueCommand(command)
    }

    /**
     * Handles receiving the 'poll' command.
     */
     private onPollCommand(uuid: string): void {
        let command: PollCommand
        try {
            command = new PollCommand(uuid)
        }
        catch (ex) {
            return
        }

        this.queueCommand(command)
    }

    /**
     * Handles receiving the 'heal' command
     */
    private onHealCommand(uuid: string, energy: number): void {
        let command: HealCommand
        try {
            command = new HealCommand(uuid, energy)
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

    private sendResponse(commandUuid: string | undefined, extraResponseFields: object | void, errorMessage?: string): void {
        const data: any = {
            ...(extraResponseFields ?? {}),
            hp: this.tank.hp,
            energy: this.tank.energy,
            uuid: commandUuid
        }

        if (errorMessage !== undefined) {
            data.error = errorMessage
        }

        this.socket.emit('response', data)
    }

    /**
     * Called every tick. Processes the next command (if any) and pushes an update to the player.
     */
    async processCommandAndNotify(): Promise<void> {
        let errorMessage: string | null = null
        let extraResponseFields: void | object
        try {
            extraResponseFields = await this.nextCommand?.execute(this.playerId, this.tank)
        }
        catch (ex) {
            console.warn(`An error occurred when processing a command:`)
            console.error(ex)

            if (ex instanceof CommandParameterError) {
                errorMessage = ex.message
            }
            else {
                errorMessage = "An error occurred while processing your last command."
            }
        }
        const commandUuid = this.nextCommand?.uuid
        this.nextCommand = null
        this.sendResponse(commandUuid, extraResponseFields, errorMessage)
    }

    /**
     * Handles the tank taking damage. Including the case where it is destroyed.
     * @param damage Hit points to subtract.
     * @returns true if the tank is dead, false if the tank still lives
     */
    handleTankDamage(damage: number): boolean {
        if (!this.tank.takeDamage(damage)) {
            // Tank is dead
            this.socket.disconnect()
            return true
        }
        return false
    }

    dispose(): void {

    }
}