import React from 'react'
import {BrowserRouter as Router, Routes, Route, Link as RouterLink} from 'react-router-dom'
import { Home } from './routes/Home'
import {NavBar} from './component/NavBar'
import {Register} from './routes/Register'
import Paper from '@mui/material/Paper'

const App = () => {
    return (
        <Paper style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
            <Router>
                <NavBar/>

                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="board" element={<p>Board</p>} />
                    <Route path="register" element={<Register/>} />
                </Routes>
            </Router>
        </Paper>
    )
}

export default App