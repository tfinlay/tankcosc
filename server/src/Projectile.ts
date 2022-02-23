import { CanvasLocation } from "./CanvasLocation";
import { DegreeAngle } from "./DegreeAngle";
import { Player } from "./Player";
import { Tank } from "./Tank";

export abstract class Projectile {
    readonly owner: Player

    location: CanvasLocation

    speed: number
    direction: DegreeAngle

    /**
     * Construct a Projectile.
     * @param owner Player that owns this projectile.
     * @param location Initial location of this projectile.
     * @param speed Distance the projectile travels per tick.
     * @param direction Direction that the projectile travels in.
     */
    constructor(owner: Player, location: CanvasLocation, speed: number, direction: DegreeAngle) {
        this.owner = owner
        this.location = location
        this.speed = speed
        this.direction = direction
    }

    /**
     * Update the projectile for the new tick (i.e. move it).
     * 
     * @returns true if the projectile should continue to exist. False to destroy it.
     */
    public tick(): boolean {
        this.location.moveWithAngle(this.speed, this.direction)

        return true
    }

    /**
     * Returns the damage to deal upon collision with the given tank. Does NOT modify the tank.
     * @param tank to take the given damage
     */
    public abstract calculateDamage(tank: Tank): number

    /**
     * Checks whether this projectile is colliding with the given tank.
     * @param tank to check for collision with
     */
    public abstract collidingWith(tank: Tank): boolean

    protected serialiseBase() {
        return {
            x: this.location.x,
            y: this.location.y,
            direction: this.direction.degrees
        }
    }

    /**
     * Serialise to a JSON representation
     */
    public abstract serialise(): {projectileType: string}
}