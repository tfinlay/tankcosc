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
}