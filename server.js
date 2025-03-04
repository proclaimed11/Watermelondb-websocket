// import express from 'express';
// import dotenv from 'dotenv';
// import clientRoutes from './src/routes/clientRoutes.js';
// import { detectConflicts } from './src/middleware/conflictMiddleware.js';
// import db from './src/db.js';


// dotenv.config();

// const app = express();

// app.use(express.json());

// // Middleware for conflict detection
// app.use('/api/sync/push', detectConflicts);

// // Routes
// app.use(clientRoutes);

// // Test DB Connection Endpoint
// app.get('/test-db', async (req, res) => {
//     try {
//         const result = await db.query('SELECT NOW()');
//         res.json({ success: true, current_time: result.rows[0].now });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'DB connection failed', error: error.message });
//     }
// });


// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




// [backend]/server.js
import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import clientRoutes from './src/routes/clientRoutes.js';
import { detectConflicts } from './src/middleware/conflictMiddleware.js';
import db from './src/db.js';
import { setupWebSocket } from './src/websocket/webSocketServer.js';

dotenv.config();
const app = express();
const httpServer = createServer(app);

// Setup WebSocket
const io = setupWebSocket(httpServer);

// Store io instance in app for use in controllers
app.set('io', io);

app.use(express.json());
app.use('/api/sync/push', detectConflicts);
app.use(clientRoutes);

// Test DB Connection Endpoint
app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ success: true, current_time: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ success: false, message: 'DB connection failed', error: error.message });
    }
});

// Start server using httpServer instead of app
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});