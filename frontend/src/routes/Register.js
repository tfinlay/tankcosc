import {useCallback, useState} from 'react'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import CircleIcon from '@mui/icons-material/Circle';
import {LoadingNotYetAttempted, LoadingPending, LoadingDone, LoadingError} from '../LoadingStatus'
import { GAME_SERVER_PATH } from '../config'

export const Register = () => {
    const [username, setUsername] = useState("")
    const [loadingState, setLoadingState] = useState(new LoadingNotYetAttempted())
    const [formError, setFormError] = useState(null)
    const [userData, setUserData] = useState(null)

    const onTextValueChanged = useCallback((evt) => {
        setFormError(null)
        setUsername(evt.target.value)
    }, [])

    const onSubmit = useCallback(async (evt) => {
        evt.preventDefault()

        if (loadingState instanceof LoadingPending) {
            return
        }

        if (username.trim() === '') {
            setFormError("A username is required")
            return
        }

        setLoadingState(new LoadingPending())

        try {
            const result = await fetch(GAME_SERVER_PATH + "/register",
             {
                 method: "POST",
                 headers: {
                     "Content-Type": "application/json"
                 },
                 body: JSON.stringify({ name: username })
             })

             if (!result.ok) {
                switch (result.status) {
                    case 400:
                        let data = await result.json()
                        console.log(data)
                        setFormError(data.error.message)
                        setLoadingState(new LoadingError())
                        return
                    default:
                        setFormError(`An unexpected error occurred. Response body: ${await result.text()}`)
                        setLoadingState(new LoadingError())
                        return
                }
             }

             setUserData(await result.json())
             setLoadingState(new LoadingDone())
        }
        catch (ex) {
            setLoadingState(new LoadingError(ex))
            setFormError(`An unexpected error occurred: ${ex.message}`)
        }
    }, [username, loadingState])

    if (userData !== null) {
        return <PostRegistrationScreen userData={userData} />
    }

    return (
        <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={onSubmit}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1
            }}
        >
            <Card sx={{minWidth: 375}}>
                {(loadingState instanceof LoadingPending) ? <LinearProgress /> : null}

                <CardHeader title='Register' />

                <CardContent>
                    <TextField
                        id="register-username-input"
                        label="Username"
                        variant="outlined"
                        sx={{width: '100%'}}
                        value={username}
                        onChange={onTextValueChanged}
                        disabled={loadingState instanceof LoadingPending}
                        error={formError !== null}
                        helperText={formError}
                    />
                </CardContent>
                <CardActions>
                    <Button type="submit" disabled={loadingState instanceof LoadingPending}>Submit</Button>
                </CardActions>
            </Card>
        </Box>
    )
}

const PostRegistrationScreen = ({ userData }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1
            }}
        >
            <Card sx={{minWidth: 375}}>
                <CardHeader title={`Welcome ${userData.name}!`} subheader='Please find your connection details below' />

                <CardContent>
                    <Box>
                        <Typography>Your colour: <CircleIcon sx={{color: userData.colour}}/></Typography>
                    </Box>

                    <Box>
                        <Typography component="div">Your secret key:</Typography>
                        <Typography sx={{fontFamily: 'monospace'}}>{userData.key}</Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}