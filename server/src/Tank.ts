import { CanvasLocation } from "./CanvasLocation"
import { DegreeAngle } from "./DegreeAngle"
import { CommandParameterError } from "./error/CommandParameterError"
import { CANVAS_HEIGHT, CANVAS_WIDTH, getRandomIntInclusive } from "./global"
import { Player } from "./Player"

/**
 * Container for the data associated with a given users' tank.
 * 
 * There are exactly one of these per connection.
 */
export class Tank {
    static readonly DEFAULT_HP = 2000
    static readonly DEFAULT_ENERGY = 10000
    static readonly MAX_ENERGY = 10000000
    static readonly ENERGY_HEAL_PER_TICK = 100
    static readonly RADIUS = 5

    hp: number = Tank.DEFAULT_HP
    get isAlive(): boolean {
        return this.hp > 0
    }

    energy: number = Tank.DEFAULT_ENERGY

    readonly location: CanvasLocation

    angle: DegreeAngle

    constructor(x: number, y: number, angle: DegreeAngle) {
        this.location = new CanvasLocation(x, y)
        this.angle = angle
    }

    /**
     * Move the tank a given distance in the current direction
     * @param distance to move in the current angle's direction
     */
    move(distance: number): void {
        this.location.moveWithAngle(distance, this.angle)
    }

    /**
     * Consume the requested amount of energy, or the amount of energy left in the tank.
     * @param energy to consume
     * @returns the actual amount of energy used (since the tank may not have all of the energy requested this may be less that requested)
     */
    consumeEnergy(energy: number): number {
        if (energy <= 0) {
            throw new CommandParameterError("Energy must be positive.")
        }

        const actualEnergy = (this.energy >= energy) ? energy : this.energy
        this.energy -= actualEnergy
        return actualEnergy
    }

    /**
     * Subtract damage from hitpoints and return true if the tank is still alive.
     * @param damage Hit points to subtract.
     * @returns true if the tank still has hp > 0
     */
    takeDamage(damage: number): boolean {
        this.hp = Math.max(0, this.hp - damage)
        return this.hp !== 0
    }

    /**
     * Charges the tank by the default amount (up to the maximum charge)
     */
    chargeEnergy(): void {
        this.energy = Math.min(Tank.MAX_ENERGY, this.energy + Tank.ENERGY_HEAL_PER_TICK)
    }

    /**
     * Rotates the tank by the given DegreeAngle.
     */
    rotate(angle: DegreeAngle): void {
        this.angle = this.angle.add(angle)
    }

    static random(): Tank {
        return new Tank(
            getRandomIntInclusive(0, CANVAS_WIDTH),
            getRandomIntInclusive(0, CANVAS_HEIGHT),
            new DegreeAngle(getRandomIntInclusive(0, 359))
        )
    }
}