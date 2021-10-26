import { playerNames, players } from "../game_state"
import { generatePrivateKey } from "../global"
import { Player } from "../Player"
import { app } from "./server"
import { updateObservers } from "../tick/update_observers"

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view.html')
})
app.get('/board', (req, res) => {
    res.sendFile(__dirname + '/view_board.html')
})
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html')
})
app.post('/register', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    const name = req.body.name
    if (typeof name === 'string' && name && !playerNames.has(name)) {
        // Register the player
        const player = new Player(name, "red")
        const key = generatePrivateKey()

        players.set(key, player)
        playerNames.add(name)

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