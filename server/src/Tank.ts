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
    static readonly MAX_ENERGY = 10000
    static readonly MAX_HP = 2000
    static readonly ENERGY_HEAL_PER_TICK = 100
    static readonly RADIUS = 10

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
     * Consumes exactly the given amount of energy or nother.
     * @param energy to consume
     * @returns true if the energy was consumed successfully. False otherwise
     */
    consumeExactEnergy(energy: number): boolean {
        if (this.energy >= energy) {
            this.energy -= energy
            return true
        }
        return false
    }

    /**
     * Heal the tank the given number of hit points
     * @param hitPoints to heal
     */
    healHp(hitPoints: number): void {
        if (hitPoints < 0) {
            throw new RangeError("Cannot heal a negative number of hitPoints")
        }

        this.hp = Math.min(Tank.MAX_HP, this.hp + hitPoints)
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