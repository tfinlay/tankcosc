import {action, makeObservable, observable, runInAction} from "mobx";
import { io } from "socket.io-client"
import {GAME_SERVER_PATH} from "../../config";


export class BoardStore {
    players = []
    tanks = []
    projectiles = []

    currentStatus = null
    key = null
    socket = null

    constructor(key) {
        makeObservable(this, {
            players: observable,
            tanks: observable,
            currentStatus: observable,
            projectiles: observable,

            start: action,
            _onDisconnect: action,
            _setupSocket: action,
            _onLoginError: action,
            _onUpdate: action
        })

        this.key = key
    }

    start() {
        this.currentStatus = null
        this._setupSocket()
    }

    _setupSocket() {
        this.socket = io(GAME_SERVER_PATH)

        this.socket.on("disconnect", () => this._onDisconnect())
        this.socket.on("loginError", (msg) => this._onLoginError(msg))
        this.socket.on("requestLogin", (msg) => this._onLoginRequest(msg))
        this.socket.on("update", (...args) => this._onUpdate(...args))
    }

    /*
     * Socket event handlers
     */
    _onDisconnect() {
        this.currentStatus = "Disconnected"
    }

    _onLoginError(message) {
        this.currentStatus = `Login Error: ${message}`
    }

    _onLoginRequest() {
        this.currentStatus = "Logging in..."
        console.log(`Attempting to log in as observer with key: ${this.key}`)
        this.socket.emit("login", "observer", this.key);
    }

    _onUpdate(players, tanks, projectiles) {
        this.currentStatus = null
        this.players = players
        this.tanks = tanks
        this.projectiles = projectiles
    }
}