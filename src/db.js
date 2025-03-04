// // File: /backend/src/db.js
// import pg from 'pg';
// import dotenv from 'dotenv';
// import EventEmitter from 'events';

// dotenv.config();

// class DatabaseEmitter extends EventEmitter {}
// const dbEmitter = new DatabaseEmitter();

// const { Pool } = pg;
// const pool = new Pool({
//     user: process.env.PG_USER,
//     host: process.env.PG_HOST,
//     database: process.env.PG_DATABASE,
//     password: process.env.PG_PASSWORD,
//     port: process.env.PG_PORT,
// });

// // Setup notification listener
// const setupNotificationListener = async () => {
//     const client = await pool.connect();
//     try {
//         await client.query('LISTEN client_changes');
//         client.on('notification', async (msg) => {
//             const payload = JSON.parse(msg.payload);
//             dbEmitter.emit('dbChange', payload);
//         });
//         console.log('PostgreSQL notification listener setup complete');
//     } catch (error) {
//         console.error('Error setting up notification listener:', error);
//         client.release();
//     }
// };

// setupNotificationListener().catch(console.error);

// export default {
//     query: (text, params) => pool.query(text, params),
//     pool,
//     dbEmitter
// };

// /backend/src/db.js
import pg from 'pg';
import dotenv from 'dotenv';
import EventEmitter from 'events';

dotenv.config();
const { Pool } = pg;

// Create an event emitter for database changes
export const dbEmitter = new EventEmitter();

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// Wrap query method to emit events
const query = async (text, params) => {
    const result = await pool.query(text, params);
    
    // Detect the type of operation from the SQL
    const sql = text.toLowerCase();
    if (sql.includes('insert into')) {
        dbEmitter.emit('dbChange', { 
            type: 'create', 
            table: 'clients_td', 
            data: result.rows[0] 
        });
    } else if (sql.includes('update')) {
        dbEmitter.emit('dbChange', { 
            type: 'update', 
            table: 'clients_td', 
            data: result.rows[0] 
        });
    } else if (sql.includes('delete from')) {
        dbEmitter.emit('dbChange', { 
            type: 'delete', 
            table: 'clients_td', 
            data: params[0] // Assuming the first param is the ID
        });
    }
    
    return result;
};

export default {
    query,
    dbEmitter
};
