import { db } from "../game_state"
import { generatePrivateKey } from "../global"
import { Player } from "../Player"
import { app } from "./server"
import { updateObservers } from "../tick/update_observers"
import { ColourGenerator } from "../ColourGenerator"

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view.html')
})
app.get('/board', (req, res) => {
    res.sendFile(__dirname + '/view_board.html')
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html')
})
app.post('/register', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

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