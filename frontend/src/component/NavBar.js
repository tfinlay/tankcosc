import React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import {Link} from 'react-router-dom'

export const NavBar = () => {
    return (
        <Box sx={{flexGrow: 0}}>
            <AppBar position='static'>
                <Container maxWidth="x1">
                    <Toolbar disableGutters>
                        <Typography variant='h6' color='inherit' noWrap component='div' sx={{ paddingRight: 2 }}>
                            TankCosc
                        </Typography>

                        <Box sx={{flexGrow: 1, display: 'flex'}}>
                            <Button
                                size="large"
                                component={Link}
                                to="/"
                                color="inherit"
                                sx={{ my: 2 }}
                            >
                                Home
                            </Button>

                            <Button
                                size="large"
                                component={Link}
                                to="/board"
                                color="inherit"
                                sx={{ my: 2 }}
                            >
                                Board
                            </Button>
                        </Box>

                        <Box sx={{ flexGrow: 0 }}>
                            <Button
                                size="large"
                                component={Link}
                                to="/register"
                                variant="contained"
                                color="secondary"
                            >
                                Register
                            </Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </Box>
    )
}