import { CanvasLocation } from "./CanvasLocation";
import { DegreeAngle } from "./DegreeAngle";
import { Player } from "./Player";
import { Projectile } from "./Projectile";
import { Tank } from "./Tank";

/**
 * Circular projectile with a radius that de-spawns upon collision with the edge of the canvas.
 */
export class BulletProjectile extends Projectile {
    readonly radius: number

    constructor(ownerId: string, location: CanvasLocation, speed: number, direction: DegreeAngle, radius: number) {
        super(ownerId, location, speed, direction)
        this.radius = radius
    }

    tick(): boolean {
        super.tick()

        return !this.location.isAtEdge
    }

    calculateDamage(tank: Tank): number {
        return this.speed * 20
    }

    public collidingWith(tank: Tank): boolean {
        const dx = tank.location.x - this.location.x
        const dy = tank.location.y - this.location.y
        const radiusSum = Tank.RADIUS + this.radius

        return dx*dx + dy*dy <= radiusSum * radiusSum
    }
    
    serialise() {
        return {
            ...this.serialiseBase(),
            projectileType: "bullet",
            radius: this.radius
        }
    }
}