import {useEffect, useRef, useState} from "react";
import {BoardStore} from "./BoardStore";
import {useSearchParams} from "react-router-dom";
import {BoardStoreContext, useBoardStore} from "./board_store_context";
import {observer} from "mobx-react-lite";
import {PlaygroundToolbar} from "../Playground/PlaygroundToolbar";
import Grid from "@mui/material/Grid";
import Editor from "@monaco-editor/react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export const Board = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [store, _] = useState(() => new BoardStore(searchParams.get("key")))

    useEffect(() => {
        store.start();
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
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'stretch', alignItems: 'stretch', height: '100vh', overflow: 'hidden'}}>
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
                    <Typography variant="h6">Scoreboard</Typography>
                    {store.players.map((player) => (
                        <Typography variant="body1" key={player.name} sx={{color: player.colour}}>{player.name} {player.score}</Typography>
                    ))}
                </Paper>
            </Grid>

            <Grid item xs={6} sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                <BoardCanvas/>
            </Grid>

            <Grid item xs={3} sx={{padding: 1}}>
                <Paper sx={{height: "100%", boxSizing: "border-box", padding: 1}}>
                    <Typography variant="h6">Join the game!</Typography>
                </Paper>
            </Grid>
        </Grid>
    )
})

const BoardCanvas = observer(() => {
    const store = useBoardStore()

    const canvasRef = useRef(null)

    return (
        <Paper sx={{width: 600, height: 600}} elevation={3}>
            <canvas ref={canvasRef} style={{width: 600, height: 600}}></canvas>
        </Paper>
    )
})