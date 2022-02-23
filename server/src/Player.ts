/**
 * Stores data about a player.
 */
export class Player {
    name: string
    colour: string
    score: number = 0

    constructor(name: string, colour: string) {
        this.name = name
        this.colour = colour
    }
}