import { DegreeAngle } from "../DegreeAngle"
import { activePlayerConnections, db } from "../game_state"
import { Player } from "../Player"
import { Tank } from "../Tank"
import { Command } from "./command"
import sortBy from "lodash/sortBy"
import {CommandParameterError} from "../error/CommandParameterError";
import Config from "../config";

/**
 * Command to heal the tank
 */
export class HealCommand extends Command {
    static readonly ENERGY_TO_HP_MULTIPLIER = 1 / 50
    readonly energy: number

    constructor(uuid: string, energy: number) {
        super(uuid)

        if (energy < 0) {
            throw new CommandParameterError()
        }

        this.energy = energy
    }

    /**
     * Computes the maximum possible amount of energy that can be consumed to heal the tank fully
     * @param tank to work with
     * @return maximum amount of energy that can be used to heal the tank without waste
     */
    determineMaximumEnergyToHeal(tank: Tank): number {
        return (Tank.MAX_HP - tank.hp) * (1/HealCommand.ENERGY_TO_HP_MULTIPLIER)
    }

    async execute(playerId: string, tank: Tank): Promise<void> {
        const boundedEnergy = Math.min(this.energy, this.determineMaximumEnergyToHeal(tank))
        if (boundedEnergy <= 0) {
            return
        }

        const actualEnergy = tank.consumeEnergy(boundedEnergy)
        tank.healHp(actualEnergy * HealCommand.ENERGY_TO_HP_MULTIPLIER)
    }
}