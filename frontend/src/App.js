import React, {useMemo} from 'react'
import {BrowserRouter as Router, Routes, Route, Link as RouterLink} from 'react-router-dom'
import { Home } from './routes/Home'
import {NavBar} from './component/NavBar'
import {Register} from './routes/Register'
import {ClassicBoard} from './routes/ClassicBoard'
import {Playground} from './routes/Playground/Playground'
import {NotFound} from './routes/NotFound'
import Paper from '@mui/material/Paper'
import {Board} from "./routes/Board/Board";
import {useSystemTheme} from "./hook/useSystemTheme";
import {createTheme, ThemeProvider} from "@mui/material";

const App = () => {
    const systemTheme = useSystemTheme()

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: systemTheme
                }
            }),
        [systemTheme]
    )

    return (
        <ThemeProvider theme={theme}>
            <Paper style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
                <Router>
                    <NavBar/>

                    <Routes>
                        <Route path="/" element={<Home/>} />
                        <Route path="classicBoard" element={<ClassicBoard/>} />
                        <Route path="board" element={<Board/>} />
                        <Route path="register" element={<Register/>} />
                        <Route path="playground/:key" element={<Playground/>} />
                        <Route path="*" element={<NotFound/>} />
                    </Routes>
                </Router>
            </Paper>
        </ThemeProvider>
    )
}

export default App