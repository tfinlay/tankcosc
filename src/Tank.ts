import { CanvasLocation } from "./CanvasLocation"
import { DegreeAngle } from "./DegreeAngle"
import { CANVAS_HEIGHT, CANVAS_WIDTH, getRandomIntInclusive } from "./global"
import { Player } from "./Player"

/**
 * Container for the data associated with a given users' tank.
 * 
 * There are exactly one of these per connection.
 */
export class Tank {
    static readonly DEFAULT_HP = 200
    static readonly DEFAULT_ENERGY = 1000
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
        const dx = distance * Math.cos(this.angle.radians)
        const dy = distance * Math.sin(this.angle.radians)
        this.location.move(dx, dy)
    }

    /**
     * Consume the requested amount of energy, or the amount of energy left in the tank.
     * @param energy to consume
     * @returns the actual amount of energy used (since the tank may not have all of the energy requested this may be less that requested)
     */
    consumeEnergy(energy: number): number {
        const actualEnergy = (this.energy > energy) ? energy : this.energy
        this.energy -= actualEnergy
        return actualEnergy
    }

    static random(): Tank {
        return new Tank(
            getRandomIntInclusive(0, CANVAS_WIDTH),
            getRandomIntInclusive(0, CANVAS_HEIGHT),
            new DegreeAngle(getRandomIntInclusive(0, 359))
        )
    }
}