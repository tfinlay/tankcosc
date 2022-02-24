import Box from "@mui/material/Box"
import { observer } from "mobx-react-lite";
import { usePlaygroundStore } from "./playground_store_context";
import { AppBar, Button, Container, IconButton, Toolbar, Tooltip, Typography } from "@mui/material"
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useCallback } from "react";


export const PlaygroundToolbar = observer(() => {
    const store = usePlaygroundStore()

    const onCopyKeyClicked = useCallback(() => {
        navigator.clipboard.writeText(store.key)
    }, [store.key])

    return (
        <AppBar position="relative" color="secondary" elevation={0}>
            <Container maxWidth="x1">
                <Toolbar disableGutters>
                    <Box sx={{flexGrow: 1, display: 'flex'}}>
                        <Button
                            color="inherit"
                            sx={{my: 2}}
                            disabled={store.isRunning}
                            onClick={() => store.start()}
                        >
                            Run
                        </Button>

                        <Button
                            color="inherit"
                            sx={{my: 2}}
                            disabled={!store.isRunning}
                            onClick={() => store.stop()}
                        >
                            Stop
                        </Button>

                        <Button
                            color="inherit"
                            sx={{my: 2}}
                            onClick={onCopyKeyClicked}
                        >
                            Copy key
                        </Button>
                    </Box>

                    <Box sx={{flexGrow: 0}}>
                        <Tooltip title={`${store.displayLogs ? 'Hide' : 'Show'} logs panel`}>
                            <IconButton
                                color="inherit"
                                size="large"
                                aria-label={`${store.displayLogs ? 'hide' : 'show'} logs panel`}
                                onClick={() => store.toggleLogs()}
                            >
                                <ListAltIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
})