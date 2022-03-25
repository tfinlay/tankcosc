import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import CircularProgress from '@mui/material/CircularProgress'
import { useParams } from "react-router-dom"
import {PlaygroundStoreContext, usePlaygroundStore} from "./playground_store_context"
import {observer} from "mobx-react-lite"
import {useCallback, useEffect, useState} from "react"
import { PlaygroundStore } from "./PlaygroundStore"
import Editor from "@monaco-editor/react"
import { PlaygroundToolbar } from "./PlaygroundToolbar"
import { Paper, Typography, Tabs, Tab, Toolbar } from "@mui/material"
import Collapse from '@mui/material/Collapse';

export const Playground = () => {
    const key = useParams().key

    const [store, _] = useState(() => new PlaygroundStore(key))

    useEffect(() => {
        return () => {
            store.dispose();
        }
    }, [store])

    return (
        <PlaygroundStoreContext.Provider value={store}>
            <PlaygroundContent/>
        </PlaygroundStoreContext.Provider>
        
    )
}

const PlaygroundContent = observer(() => {
    const store = usePlaygroundStore()

    const onEditorMounted = useCallback((editor, monaco) => {
        console.log("Monaco editor mounted")
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => store.saveToCurrentFile())
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_R, () => store.start())
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_R, () => store.stop())
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_O, () => store.setFilePickerOpen(true))

        // Disable 'unnecessary await' quick fix recommendation (since it reports await as unnecessary for print)
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            diagnosticCodesToIgnore: [80007]
        })
    }, [store])

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'stretch', alignItems: 'stretch', height: '100vh', overflow: 'hidden'}}>
            <PlaygroundToolbar />

            <Grid container spacing={2} sx={{flex: 1, alignItems: 'stretch'}}>
                <Grid item xs={(store.displaySidePanel) ? 7 : 12}>
                    <Editor
                        height="calc(100vh - 68.5px)"
                        language="javascript"
                        value={store.code}
                        loading={<CircularProgress/>}
                        onChange={value => store.onCodeChange(value)}
                        onMount={onEditorMounted}
                    />
                </Grid>

                {(store.displaySidePanel) ? (
                    <PlaygroundSidePanel />
                ) : null}
            </Grid>
        </Box>
    )
})

const PlaygroundSidePanel = observer(() => {
    const store = usePlaygroundStore()

    const showingBotStats = store.hasBotStats
    const botStatsHeight = 150

    return (
        <Grid item xs={5}>
            <Collapse in={showingBotStats}>
                <Paper sx={{height: botStatsHeight, boxSizing: 'border-box', margin: 1, marginLeft: 0, padding: 1}}>
                    <Typography variant='h6'>Bot statistics</Typography>
                    <Grid container spacing={2}>
                        <Grid item sx={{textAlign: 'center'}} xs={6}>
                            <Typography variant="h3" sx={{color: 'red'}}>{store.botHp ?? "-"}</Typography>
                            <Typography>Hit Points</Typography>
                        </Grid>

                        <Grid item sx={{textAlign: 'center'}} xs={6}>
                            <Typography variant="h3" sx={{color: 'gold'}}>{store.botEnergy ?? "-"}</Typography>
                            <Typography>Energy</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>
            
            

            <Paper sx={{height: `calc(100vh - ${85 + (showingBotStats ? botStatsHeight + 20 : 0)}px)`, boxSizing: 'border-box', margin: 1, marginLeft: 0, padding: 1, display: 'flex', flexDirection: 'column'}}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={store.sidePanelTab} onChange={(_, val) => store.setSidePanelTab(val)}>
                        <Tab label="Documentation" value="docs" />
                        <Tab label="Logs" value="logs" />
                    </Tabs>
                </Box>
                
                <Box sx={{flex: 1, overflowY: 'scroll'}}>
                    {(store.sidePanelTab === "docs") ? (
                        <PlaygroundDocumentationPanel/>
                    ) : null}

                    {(store.sidePanelTab === "logs") ? (
                        <PlaygroundLogsPanel/>
                    ) : null}
                </Box>
            </Paper>
        </Grid>
    )
})

const PlaygroundLogsPanel = observer(() => {
    const store = usePlaygroundStore()

    if (store.logs.length === 0) {
        return (
            <Box>
                <Typography variant="subtitle2">Nothing here yet!</Typography>
                <Typography variant="body2">Hit "Run" to see the data your program <code>print()</code>s here.</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{display: "flex", flexDirection: "column-reverse"}}>
            {store.logs.map((log, index) => (
                <Box key={log.id}>
                    <Typography variant="caption" sx={{fontFamily: "monospace"}} component="span">{log.date}</Typography>
                    <Typography variant="body1" sx={{fontFamily: "monospace"}} component="span"> {log.message}</Typography>
                </Box>
            ))}
        </Box>
    )
})

const PlaygroundDocumentationPanel = () => {
    return (
        <Box>
            <Typography variant="h5">Functions</Typography>
            <Typography variant="subtitle2">NOTE: Please place <code>await</code> before any of these function calls, otherwise your bot will lose sync with the server!</Typography>

            <Typography variant="h6" sx={{fontFamily: 'monospace'}}>print(message)</Typography>
            <Typography variant="body1">
                This function takes 0 turns and places the text that you specify in it in the log.
                See the example code or <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Text_formatting#multi-line_template_literals" target="_blank">here</a> for some handy ways to print things the way you like!
            </Typography>

            <Typography variant="h6" sx={{fontFamily: 'monospace', marginTop: 1}}>shoot(energy)</Typography>
            <Typography variant="body1">
                Takes 1 turn. Shoots with the energy given in the direction that your tank is currently facing.
            </Typography>
            <Typography variant="body1" sx={{marginTop: 1}}>
                All shots are the same size, but the speed (and the damage inflicted in case of a collision) increases linearly with the amount of energy they are given.
            </Typography>

            <Typography variant="h6" sx={{fontFamily: 'monospace', marginTop: 1}}>rotate(degrees)</Typography>
            <Typography variant="body1">
                Takes 1 turn. Rotates the tank a given number of degrees clockwise. Negative values are permitted.
            </Typography>

            <Typography variant="h6" sx={{fontFamily: 'monospace', marginTop: 1}}>move(energy)</Typography>
            <Typography variant="body1">
                Takes 1 turn. Consumes the given amount of energy an moves the tank a distance in the direction that it is facing.
            </Typography>
            <Typography variant="body1" sx={{marginTop: 1}}>
                The distance travelled is given by this equation: <code>log10(log10(energy)) * 4 + 1</code>
            </Typography>

            <Typography variant="h6" sx={{fontFamily: 'monospace', marginTop: 1}}>scan()</Typography>
            <Typography variant="body1">
                Takes 1 turn and 200 energy. Scans the surroundings of the tank, yielding a list of all other live tanks with their distance and the approximate number of degrees rotation needed to be facing them (in order from closest to farthest enemy).
            </Typography>
            <Typography variant="body1" sx={{marginTop: 1}}>
                This data is placed into <code>lastScanResult</code>, which is an array of ranging measurements. For example, to get the distance and relative angle of the closest enemy from this tank:

                <code>
                    {`let target = lastScanResult[0];<br/>
                    print(\`Distance: \${target.distance}. Rotation: \${target.relativeAngle}\`)`}
                </code>
            </Typography>
        </Box>
    )
}