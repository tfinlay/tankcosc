import { getRandomIntInclusive } from "./global"

export type RgbArray = [red: number, green: number, blue: number]

/**
 * Class that randomly generates visually appealing colours.
 * Taken from here: https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
 */
export class ColourGenerator {
    private static GOLDEN_RATIO_CONJUGATE = 0.618033988749895

    public static default = new ColourGenerator(0.99, 0.99)

    hue: number
    saturation: number
    value: number

    /**
     * Converts HSV values (in the floating point range [0,1) to RGB values in the integer range [0, 255])
     * @param h Hue
     * @param s Saturation
     * @param v Value
     */
    static hsvToRgb(h: number, s: number, v: number): RgbArray {
        const h_i = Math.floor(h*6)
        const f = h*6 - h_i
        const p = v * (1 - s)
        const q = v * (1 - f*s)
        const t = v * (1 - (1 - f) * s)

        let [r, g, b] = [0, 0, 0]

        switch (h_i) {
            case 0:
                [r, g, b] = [v, t, p]
                break
            case 1:
                [r, g, b] = [q, v, p]
                break
            case 2:
                [r, g, b] = [p, v, t]
                break
            case 3:
                [r, g, b] = [p, q, v]
                break
            case 4:
                [r, g, b] = [t, p, v]
                break
            case 5:
                [r, g, b] = [v, p, q]

        }

        return [Math.floor(r*256), Math.floor(g*256), Math.floor(b*256)]
    }

    /**
     * Converts a colour from RGB components into a CSS/HTML-compatible string.
     * @param r Red component in integer range [0,255].
     * @param g Green component in integer range [0,255].
     * @param b Blue component in integer range [0,255].
     * @returns #-Hexidecimal formatted string for the given colour.
     */
    static rgbToString(r: number, g: number, b: number) {
        const toHexStringPart = (num: number) => num.toString(16).padStart(2, '0')

        return `#${toHexStringPart(r)}${toHexStringPart(g)}${toHexStringPart(b)}`
    }

    getNext(): RgbArray {
        this.hue += ColourGenerator.GOLDEN_RATIO_CONJUGATE
        this.hue %= 1
        return ColourGenerator.hsvToRgb(this.hue, this.saturation, this.value)
    }

    getNextString(): string {
        const rgb = this.getNext()
        return ColourGenerator.rgbToString(...rgb)
    }

    constructor(saturation: number, value: number) {
        this.hue = getRandomIntInclusive(1, 1024) / 1024
        this.saturation = saturation
        this.value = value
    }
}