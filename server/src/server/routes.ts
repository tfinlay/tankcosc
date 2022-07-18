import { db } from "../game_state"
import { generatePrivateKey } from "../global"
import { Player } from "../Player"
import { app } from "./server"
import { updateObservers } from "../tick/update_observers"
import { ColourGenerator } from "../ColourGenerator"
import { Request } from "express";
import Config from "../config";

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view.html')
})
app.get('/board', (req, res) => {
    res.sendFile(__dirname + '/view_board.html')
})
app.get("/download/cli", (req: Request<{}, {}, {}, {platform: string}>, res) => {
    if (Object.keys(Config.tankoCliServeInfo).includes(req.query.platform)) {
        const fileInfo = Config.tankoCliServeInfo[req.query.platform]!
        res.sendFile(fileInfo.localPath, {
            root: "cli_assets",
            headers: {
                "Content-Disposition": `attachment; filename="${fileInfo.servedFilename}"`
            }
        })
    }
    else {
        res.status(404).send(`Unrecognised or missing platform. Please specify one of the following platforms: ${Object.keys(Config.tankoCliServeInfo).join(", ")}.`)
    }
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html')
})
app.post('/register', async (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    const name = req.body.name
    if (typeof name === 'string' && name && (await db.getPlayerNames()).indexOf(name) === -1) {
        // Register the player
        const player = new Player(name, ColourGenerator.default.getNextString())
        const key = generatePrivateKey()

        await db.setPlayer(key, player)

        res.end(JSON.stringify({
            name: name,
            colour: player.colour,
            key: key
        }))

        setTimeout(updateObservers, 0)
    }
    else {
        res.status(400)
        res.end(JSON.stringify({
            error: {
                message: "Name is not defined, of incorrect type, or is already in use."    
            }
        }))
    }
})