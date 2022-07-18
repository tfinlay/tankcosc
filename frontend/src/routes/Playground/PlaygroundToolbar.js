import Box from "@mui/material/Box"
import { observer } from "mobx-react-lite";
import { usePlaygroundStore } from "./playground_store_context";
import { AppBar, Button, Container, IconButton, Toolbar, Tooltip, Typography, Modal, Dialog, Divider } from "@mui/material"
import ListAltIcon from '@mui/icons-material/ListAlt';
import {useCallback, useState} from "react";
import { FilePickerPopupContent } from "./FilePicker"
import {CliDownloadPopup} from "../../component/CliDownloadPopup";


export const PlaygroundToolbar = observer(() => {
    const [showCliDownload, setShowCliDownload] = useState(false)
    const store = usePlaygroundStore()

    const onCopyKeyClicked = useCallback(() => {
        navigator.clipboard.writeText(store.key)
    }, [store.key])

    return (
        <>
            <AppBar position="relative" color="secondary" elevation={0} height={68.5}>
                <Container maxWidth="x1">
                    <Toolbar disableGutters>
                        <Box sx={{flexGrow: 1, display: 'flex'}}>
                            <Tooltip title="Run (Ctrl + R)">
                                <span>
                                    <Button
                                        color="inherit"
                                        sx={{my: 2}}
                                        disabled={store.isRunning}
                                        onClick={() => store.start()}
                                    >
                                        Run
                                    </Button>
                                </span>
                            </Tooltip>

                            <Tooltip title="Stop (Ctrl + Shift + R)">
                                <span>
                                    <Button
                                        color="inherit"
                                        sx={{my: 2}}
                                        disabled={!store.isRunning}
                                        onClick={() => store.stop()}
                                    >
                                        Stop
                                    </Button>
                                </span>
                            </Tooltip>

                            <Tooltip title="Copy your secret key to the clipboard">
                                <Button
                                    color="inherit"
                                    sx={{my: 2, marginRight: 1}}
                                    onClick={onCopyKeyClicked}
                                >
                                    Copy key
                                </Button>
                            </Tooltip>

                            <Tooltip title="Write your bot without language or tool restrictions">
                                <Button
                                    color="inherit"
                                    sx={{my: 2, marginRight: 1}}
                                    onClick={() => setShowCliDownload(true)}
                                >
                                    Download Tanko CLI
                                </Button>
                            </Tooltip>

                            <Divider sx={{background: "white"}} orientation="vertical" variant="middle" light={true} flexItem />

                            <Typography variant='body1' color='inherit' noWrap component='div' sx={{ paddingLeft: 2, paddingRight: 1, lineHeight: "68px" }}>
                                {store.currentFileName}
                            </Typography>

                            <Tooltip title="Open a different code file (Ctrl + O)">
                                <Button
                                    color="inherit"
                                    sx={{my: 2}}
                                    onClick={() => store.setFilePickerOpen(true)}
                                >
                                    Choose File
                                </Button>
                            </Tooltip>
                        </Box>

                        <Box sx={{flexGrow: 0}}>
                            <Tooltip title={`${store.displaySidePanel ? 'Hide' : 'Show'} side panel`}>
                                <IconButton
                                    color="inherit"
                                    size="large"
                                    aria-label={`${store.displaySidePanel ? 'hide' : 'show'} side panel`}
                                    onClick={() => store.toggleSidePanel()}
                                    autoFocus
                                >
                                    <ListAltIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Dialog
                open={store.filePickerOpen}
                onClose={() => store.setFilePickerOpen(false)}
                scroll="body"
            >
                <FilePickerPopupContent onClose={() => store.setFilePickerOpen(false)}/>
            </Dialog>

            <CliDownloadPopup open={showCliDownload} onClose={() => setShowCliDownload(false)} secretKey={store.key}/>
        </>
    )
})