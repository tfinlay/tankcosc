import {v4 as uuidv4} from 'uuid'

export const CANVAS_WIDTH = 600
export const CANVAS_HEIGHT = 600

export const OBSERVER_KEY = "abc123"//generatePrivateKey()

// Credit to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
export function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

export const generatePrivateKey = (): string => {
    return uuidv4().replace(/-/ig, '')
}