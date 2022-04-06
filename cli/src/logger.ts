import winston, {createLogger} from "winston";

const loggingLevels = {
    levels: {
        echo: 0,
        debug: 1,
        info: 2,
        warn: 3,
        error: 4
    },
    colors: {
        echo: 'black',
        debug: 'magenta',
        info: 'blue',
        warn: 'orange',
        error: 'red'
    }
}

const logger = createLogger({
    transports: [
        new winston.transports.Console({
            level: 'info',
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

export default logger