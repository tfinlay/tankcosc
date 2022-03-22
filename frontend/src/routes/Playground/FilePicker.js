import { Typography, Box, List, ListItem, ListItemText, ListItemIcon,  DialogTitle, Fab, Toolbar, IconButton, DialogContent, TextField, Button, Tooltip, Dialog, DialogActions } from "@mui/material"
import {observer} from "mobx-react-lite"
import { usePlaygroundStore } from "./playground_store_context";
import JavascriptIcon from '@mui/icons-material/Javascript';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState, useCallback, useEffect } from "react";
import { PlaygroundStore } from "./PlaygroundStore";


export const FilePickerPopupContent = observer((props) => {
    const {onClose} = props
    const store = usePlaygroundStore()
    const [newFileDialogOpen, setNewFileDialogOpen] = useState(false)

    const onFileChosen = useCallback((name) => {
        store.openFile(name)
        onClose()
    }, [store, onClose])

    const onNewFileNameChosen = useCallback((name) => {
        setNewFileDialogOpen(false)
        if (name === null) {
            return
        }

        store.createFile(name)
    }, [store, setNewFileDialogOpen])

    return (
        <Box sx={{width: 450, maxWidth: "100%"}}>
            <DialogTitle variant="h6">Choose File</DialogTitle>

            <DialogContent>
                <List>
                    {store.fileNames.map(name => (
                        <FilePickerFileItem key={`file-${name}`} name={name} onFileChosen={onFileChosen}/>
                    ))}
                </List>
            </DialogContent>

            <DialogActions>
                    <Tooltip title="Create new">
                        <Fab
                            size="small"
                            color="secondary"
                            aria-label="create new"
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                right: 16
                            }}
                            onClick={() => setNewFileDialogOpen(true)}
                        >
                            <AddIcon/>
                        </Fab>
                    </Tooltip>
            </DialogActions>

            <FileNameChooserDialog open={newFileDialogOpen} onClose={onNewFileNameChosen}/>
        </Box>
    )
})

const FilePickerFileItem = observer(({name, onFileChosen}) => {
    const store = usePlaygroundStore()

    const isCurrentFile = store.currentFileName === name
    const isDefaultFile = name === PlaygroundStore.DEFAULT_FILE_NAME

    const onDeleteClicked = useCallback((evt) => {
        evt.stopPropagation()
        store.deleteFile(name)
    }, [name, store])

    return (
    <>
        <ListItem
            button
            onClick={() => onFileChosen(name)}
            secondaryAction={(
                <Toolbar>
                    {(isCurrentFile || isDefaultFile) ? undefined : (
                        <Tooltip title="Delete">
                            <IconButton
                                edge="end"
                                aria-label="delete file"
                                onClick={onDeleteClicked}
                            >
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                    )}
                </Toolbar>
            )}
        >
            <ListItemIcon>
                <JavascriptIcon/>
            </ListItemIcon>
            <ListItemText primary={name} secondary={(isCurrentFile) ? "Current file" : ((isDefaultFile) ? "Default file" : undefined)}/>
        </ListItem>
    </>
    )
})

const FileNameChooserDialog = observer(({open, onClose}) => {
    const store = usePlaygroundStore()

    const [name, setName] = useState("")
    const [nameError, setError] = useState(null)

    // Reset the form
    useEffect(() => {
        setName("")
        setError(null)
    }, [open])

    const getNameWithExtension = useCallback((name) => {
        return (name.endsWith(".js")) ? name : name + ".js"
    }, [])

    const validateName = useCallback((name) => {
        if (!name) {
            setError("A value is required.")
            return false
        }
        
        if (store.checkFileExistence(getNameWithExtension(name))) {
            setError("A file with this name already exists.")
            return false
        }

        setError(null)
        return true
    }, [store, getNameWithExtension])

    const onSubmit = useCallback((evt) => {
        evt.preventDefault()

        if (validateName(name)) {
            onClose(getNameWithExtension(name))
        }
    }, [name, validateName, onClose, getNameWithExtension])

    const onCancel = useCallback(() => {
        onClose(null)
    })

    const onNameChanged = useCallback((evt) => {
        const name = evt.target.value
        setName(name)
        validateName(name)
    }, [setName, validateName])

    return (
        <Dialog open={open} onClose={onCancel}>
            <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={onSubmit}
            >
                <DialogTitle>Enter file name</DialogTitle>

                <DialogContent>
                    <Box>
                        <TextField
                            id="filepicker-name-input"
                            autoFocus
                            label="File name"
                            variant="outlined"
                            value={name}
                            margin="dense"
                            onChange={onNameChanged}
                            error={nameError !== null}
                            helperText={nameError}
                        />
                    </Box>
                </DialogContent>
                
                <DialogActions>
                    <Button type="submit">Done</Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
})