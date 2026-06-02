const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const plateRoutes = require('./routes/plate');
const authRoutes = require('./routes/auth');
const { initSocket } = require('./socket/events');
const pool = require('./db/connection');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

initSocket(io);

const dashboardRoutes = require('./routes/dashboard');

app.use('/api/plate', plateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'OK', db: 'Connected' });
    } catch (err) {
        res.status(500).json({ status: 'Error', db: 'Disconnected' });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
