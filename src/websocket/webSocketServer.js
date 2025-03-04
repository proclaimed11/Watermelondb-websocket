// File: /backend/src/websocket/webSocketServer.js
import { Server } from 'socket.io';
import db from '../db.js';

export function setupWebSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const connectedClients = new Set();

    // Listen for database changes
    db.dbEmitter.on('dbChange', (payload) => {
        console.log('Database change detected:', payload);
        io.emit('databaseChanged', payload);
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        connectedClients.add(socket.id);
        io.emit('userCount', connectedClients.size);

        // Original client change handling
        socket.on('clientChange', (change) => {
            console.log('Client change received:', change);
            socket.broadcast.emit('remoteChange', change);
        });

        socket.on('syncStarted', () => {
            socket.broadcast.emit('otherClientSyncing', socket.id);
        });

        socket.on('syncCompleted', () => {
            socket.broadcast.emit('otherClientSyncComplete', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            connectedClients.delete(socket.id);
            io.emit('userCount', connectedClients.size);
        });
    });

    return io;
}