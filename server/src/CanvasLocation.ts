import { DegreeAngle } from "./DegreeAngle"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./global"

export class CanvasLocation {
    private _xVal: number
    private _yVal: number

    set x(newValue: number) {
        this._xVal = this.intoRange(newValue, CANVAS_WIDTH)
    }

    set y(newValue: number) {
        this._yVal = this.intoRange(newValue, CANVAS_HEIGHT)
    }

    get x(): number {
        return this._xVal
    }
    
    get y(): number {
        return this._yVal
    }

    get isAtEdge(): boolean {
        return this.x === 0 || this.x === CANVAS_WIDTH || this.y === 0 || this.y === CANVAS_HEIGHT
    }

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    private intoRange(value: number, rangeMax: number): number {
        return Math.max(0, Math.min(value, rangeMax))
    }

    move(dx: number, dy: number): void {
        this.x += dx
        this.y += dy
    }

    moveWithAngle(distance: number, angle: DegreeAngle): void {
        const dx = distance * Math.cos(angle.radians)
        const dy = distance * Math.sin(angle.radians)
        this.move(dx, dy)
    }

    copy(): CanvasLocation {
        return new CanvasLocation(this.x.valueOf(), this.y.valueOf())
    }
}