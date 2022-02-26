import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import CircularProgress from '@mui/material/CircularProgress'
import { useParams, useSearchParams } from "react-router-dom"
import {PlaygroundStoreContext, usePlaygroundStore} from "./playground_store_context"
import {observer} from "mobx-react-lite"
import { useState } from "react"
import { PlaygroundStore } from "./PlaygroundStore"
import Editor from "@monaco-editor/react"
import { PlaygroundToolbar } from "./PlaygroundToolbar"
import { Paper, Typography } from "@mui/material"

export const Playground = () => {
    const key = useParams().key
    const [searchParams, setSearchParams] = useSearchParams()

    const [store, _] = useState(() => new PlaygroundStore(key))

    return (
        <PlaygroundStoreContext.Provider value={store}>
            <PlaygroundContent/>
        </PlaygroundStoreContext.Provider>
        
    )
}

const PlaygroundContent = observer(() => {
    const store = usePlaygroundStore()

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'stretch', alignItems: 'stretch', height: '100vh', overflow: 'hidden'}}>
            <PlaygroundToolbar />

            <Grid container spacing={2} sx={{flex: 1, alignItems: 'stretch'}}>
                <Grid item xs={(store.displayLogs) ? 7 : 12}>
                    <Editor
                        height="calc(100vh - 68.5px)"
                        language="javascript"
                        value={store.code}
                        loading={<CircularProgress/>}
                        onChange={value => store.onCodeChange(value)}
                    />
                </Grid>

                {(store.displayLogs) ? (
                    <PlaygroundLogsPanel/>
                ) : null}
            </Grid>
        </Box>
    )
})

const PlaygroundLogsPanel = observer(() => {
    const store = usePlaygroundStore()

    return (
        <Grid item xs={5}>
            <Paper sx={{height: 'calc(100vh - 85px)', boxSizing: 'border-box', overflowY: 'scroll', margin: 1, marginLeft: 0, padding: 1}}>
                {store.logs.map((log, index) => (
                    <Box key={index}>
                        <Typography variant="caption" component="span">{log.date}</Typography>
                        <Typography variant="body1" component="span"> {log.message}</Typography>
                    </Box>
                ))}
            </Paper>
        </Grid>
    )
})