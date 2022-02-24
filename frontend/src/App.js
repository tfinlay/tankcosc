import React from 'react'
import {BrowserRouter as Router, Routes, Route, Link as RouterLink} from 'react-router-dom'
import { Home } from './routes/Home'
import {NavBar} from './component/NavBar'
import {Register} from './routes/Register'
import {Board} from './routes/Board'
import {Playground} from './routes/Playground/Playground'
import {NotFound} from './routes/NotFound'
import Paper from '@mui/material/Paper'

const App = () => {
    return (
        <Paper style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
            <Router>
                <NavBar/>

                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="board" element={<Board/>} />
                    <Route path="register" element={<Register/>} />
                    <Route path="playground/:key" element={<Playground/>} />
                    <Route path="*" element={<NotFound/>} />
                </Routes>
            </Router>
        </Paper>
    )
}

export default App