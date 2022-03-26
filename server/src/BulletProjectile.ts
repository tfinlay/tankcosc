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

    protected getLineLength(ax, ay, bx, by) {
        return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2))
    }

    public collidedInLastTickWith(tank: Tank): boolean {
        // Compliments to: https://math.stackexchange.com/a/408020
        const Cx = tank.location.x
        const Cy = tank.location.y
        const R = Tank.RADIUS

        const Ax = this.location.x
        const Bx = this.lastTickLocation.x
        const Ay = this.location.y
        const By = this.lastTickLocation.y

        const d = this.getLineLength(Ax, Ay, Bx, By)
        const alpha = (1/(d*d))*((Bx-Ax)*(Cx-Ax)+(By-Ay)*(Cy-Ay))

        const Mx = Ax + (Bx - Ax)*alpha
        const My = Ay + (By - Ay)*alpha

        const lenMC = this.getLineLength(Cx, Cy, Mx, My)

        if (lenMC <= R) {
            // Check if M is in the segment
            if (this.getLineLength(Mx, My, Ax, Ay) <= d || this.getLineLength(Mx, My, Bx, By) <= d) {
                return true
            }
            else {
                // Check if the segment and circle intersect
                return this.getLineLength(Ax, Ay, Cx, Cy) <= R || this.getLineLength(Bx, By, Cx, Cy) <= R
            }
        }

        return false
    }
    
    serialise() {
        return {
            ...this.serialiseBase(),
            projectileType: "bullet",
            radius: this.radius
        }
    }
}