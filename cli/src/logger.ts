import winston, {createLogger} from "winston";

const loggingLevels = {
    levels: {
        echo: 4,
        debug: 3,
        info: 2,
        warn: 1,
        error: 0
    },
    colors: {
        echo: 'black',
        debug: 'magenta',
        info: 'blue',
        warn: 'yellow',
        error: 'red'
    }
}

const logger = createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
    levels: loggingLevels.levels,
    level: "info"
})
winston.addColors(loggingLevels.colors)

export const setLogLevel = (level: "echo" | "debug" | "info" | "warn" | "error") => {
    logger.transports.map(transport => transport.level = level)
    logger.level = level
}

export default logger