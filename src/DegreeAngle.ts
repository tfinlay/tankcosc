export class DegreeAngle {
    readonly degrees: number

    get radians(): number {
        return this.degrees * (Math.PI / 180)
    }

    constructor(degrees: number) {
        this.degrees = degrees

        while (this.degrees < 0) {
            this.degrees += 360
        }

        this.degrees %= 360
    }

    add(angle: DegreeAngle | number): DegreeAngle {
        return new DegreeAngle(this.degrees + ((angle instanceof DegreeAngle) ? angle.degrees : angle))
    }

    sub(angle: DegreeAngle | number): DegreeAngle {
        return new DegreeAngle(this.degrees - ((angle instanceof DegreeAngle) ? angle.degrees : angle))
    }
}

export const angle = (value: number): DegreeAngle => new DegreeAngle(value)