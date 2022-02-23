import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, TextField } from "@mui/material"
import {useEffect, useState} from "react"
import { GAME_SERVER_PATH } from "../config"

export const Board = () => {

    const [key, setKey] = useState(null)

    return (
        <div>
            <GetKeyDialog open={key === null} submitKey={setKey}/>

            {(key !== null) ? (
                <iframe src={GAME_SERVER_PATH + "/board?" + key} style={{width: "100%", height: "calc(100vh - 5px)", border: "none", paddingTop: 10}}/>
            ) : null}
        </div>
    )
}

const GetKeyDialog = ({open, submitKey}) => {
    const [key, setKey] = useState("")

    const onSubmit = (evt) => {
        evt.preventDefault()

        submitKey(key)
    }

    return (
        <Dialog open={open}>
            <form onSubmit={onSubmit}>
                <DialogTitle>Access key required</DialogTitle>
                <DialogContent>
                    <DialogContentText>To view the board please enter the access code below:</DialogContentText>
                        <TextField
                            autoFocus
                            variant="outlined"
                            type="password"
                            label="Access Code"
                            value={key}
                            onChange={evt => setKey(evt.target.value)}
                            sx={{width: '100%'}}
                        />
                </DialogContent>
                <DialogActions>
                    <Button type="submit">Submit</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}