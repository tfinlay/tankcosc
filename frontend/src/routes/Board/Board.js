import {useEffect, useRef, useState} from "react";
import {BoardStore} from "./BoardStore";
import {useSearchParams} from "react-router-dom";
import {BoardStoreContext, useBoardStore} from "./board_store_context";
import {observer} from "mobx-react-lite";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import QRCode from "qrcode";
import {CircularProgress} from "@mui/material";
import {autorun} from "mobx";

export const Board = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [store, _] = useState(() => new BoardStore(searchParams.get("key")))

    useEffect(() => {
        store.start();
        return () => {
            store.dispose();
        }
    }, [store])

    return (
        <BoardStoreContext.Provider value={store}>
            <BoardContentRoot/>
        </BoardStoreContext.Provider>
    )
}

const BoardContentRoot = observer(() => {
    const store = useBoardStore()

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'stretch', alignItems: 'stretch', height: '100vh', marginTop: 1, overflow: 'hidden'}}>
            {(store.currentStatus) ? (
                <Typography variant="h3" sx={{marginTop: 2}}>{store.currentStatus}</Typography>
            ) : (
                <BoardContent/>
            )}
        </Box>
    )
})

const BoardContent = observer(() => {
    const store = useBoardStore()

    return (
        <Grid container sx={{height: "100%"}}>
            <Grid item xs={3} sx={{padding: 1}}>
                <Paper sx={{height: "100%", boxSizing: "border-box", padding: 1}}>
                    <PlayerPanelContent/>
                </Paper>
            </Grid>

            <Grid item xs={6} sx={{display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1}}>
                <BoardCanvas/>
            </Grid>

            <Grid item xs={3} sx={{padding: 1}}>
                <Paper sx={{height: "100%", boxSizing: "border-box", padding: 1}}>
                    <JoinPanelContent/>
                </Paper>
            </Grid>
        </Grid>
    )
})

const PlayerPanelContent = observer(() => {
    const store = useBoardStore()

    return (
    <>
        <Typography variant="h6">Scoreboard</Typography>
        {store.players.map((player) => (
            <Typography variant="body1" key={player.name} sx={{color: player.colour}}>{player.name} {player.score}</Typography>
        ))}
    </>
    )
})

const JoinPanelContent = observer(() => {
    const store = useBoardStore()
    const [qrcodeData, setQrcodeData] = useState(null);

    useEffect(async () => {
        try {
            setQrcodeData(await QRCode.toDataURL(window.location.origin, {
                errorCorrectionLevel: 'H',
                scale: 32,
                margin: 0
            }));
        }
        catch (e) {
            setQrcodeData({
                error: true
            })
        }
    }, [setQrcodeData])

    return (
    <>
        <Typography variant="h6">Join the game!</Typography>
        {(qrcodeData === null) ? (
            <CircularProgress/>
        ) : (
            (qrcodeData.error === undefined) ? (
                <Box sx={{textAlign: 'center', width: '100%', padding: '0 32px', paddingTop: 1, boxSizing: 'border-box'}}>
                    <img src={qrcodeData} style={{width: '100%', maxWidth: 300}} alt={window.location.origin}/>
                </Box>
            ) : (
                <></>
            )
        )}

        <Typography variant="h6" sx={{textAlign: 'center'}}>{window.location.origin}</Typography>

    </>
    )
})

const drawOnBoardCanvas = (store, canvasEl) => {
    const ctx = canvasEl.getContext('2d')

    ctx.scale(3, 3)

    ctx.font = "bold 12px monospace"
    ctx.textAlign = "center"

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

    for (const tank of store.tanks) {
        ctx.fillStyle = tank.colour

        // Name label
        ctx.fillText(tank.playerName.slice(0, 7), tank.x, tank.y - 10)

        // The tank itself
        const angleRads = tank.angle * (Math.PI/180)
        ctx.beginPath()
        ctx.arc(tank.x, tank.y, tank.radius, 0, 2*Math.PI)

        ctx.fill()

        // The direction of the tank
        ctx.fillStyle = "black"
        ctx.beginPath()
        ctx.arc(
            tank.x + (tank.radius * Math.cos(angleRads)),
            tank.y + (tank.radius * Math.sin(angleRads)),
            2,
            0,
            2*Math.PI
        )
        ctx.fill()

        // The health chart
        if (tank.hpPercentage < 1) {
            ctx.fillStyle = "white"
            ctx.beginPath()
            ctx.arc(
                tank.x,
                tank.y,
                3,
                Math.PI / 2,
                2 * Math.PI * tank.hpPercentage + (Math.PI/2)
            )
            ctx.fill()

            ctx.fillStyle = tank.colour
            ctx.beginPath()
            ctx.arc(tank.x, tank.y, 1.5, 0, 2*Math.PI)
            ctx.fill()
        }
    }

    ctx.fillStyle = "black"
    for (const proj of store.projectiles) {
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, proj.radius, 0, 2*Math.PI)
        ctx.fill()
    }

    ctx.scale(1/3, 1/3)
}

const BoardCanvas = observer(() => {
    const store = useBoardStore()
    const [canvasSize, setCanvasSize] = useState(1800)
    const [bodyHeight, setBodyHeight] = useState(1800)

    const bodyRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvasEl = canvasRef.current

        if (canvasEl !== null) {
            return autorun(() => drawOnBoardCanvas(store, canvasEl))
        }
    }, [canvasRef])

    useEffect(() => {
        const bodyEl = bodyRef.current

        if (bodyEl !== null) {
            const observer = new ResizeObserver(entries => {
                if (entries.length === 1) {
                    const entry = entries[0]
                    setCanvasSize(Math.max(
                        600,
                        Math.min(entry.contentRect.width, entry.contentRect.height) - 50
                    ))
                    setBodyHeight(entry.contentRect.height)
                }
            })

            observer.observe(bodyEl)

            return () => {
                observer.disconnect()
            }
        }
    }, [bodyRef])

    return (
        <Box ref={bodyRef} sx={{width: '100%', height: '100%', display: "flex", justifyContent: "center", position: "relative"}} >
            <Box sx={{top: `${(bodyHeight - canvasSize) / 2}px`, position: "absolute"}}>
                <Paper sx={{transform: `scale(${canvasSize/1800}, ${canvasSize/1800})`, transformOrigin: 'top center', width: 1800, height: 1800}} elevation={3}>
                    <canvas ref={canvasRef} width={1800} height={1800} />
                </Paper>
            </Box>
        </Box>
    )
})