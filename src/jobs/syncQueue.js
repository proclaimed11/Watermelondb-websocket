import { query } from "../db.js";
import { detectConflicts } from "../middleware/conflictMiddleware.js";

// A simple in-memory queue. Use a library like BullMQ for production.
const syncQueue = [];

export const addClientsToSyncQueue = (clients) => {
    clients.forEach(client => syncQueue.push(client));
    processSyncQueue();
};

const processSyncQueue = async () => {
    if (syncQueue.length === 0) return;
    console.log('Processing sync queue...');

    try {
        const conflicts = await detectConflicts(syncQueue);
        if (conflicts.length > 0) {
            console.warn('Conflicts detected:', conflicts.map(c => c.id));
            // Remove conflicting clients from the queue
            syncQueue = syncQueue.filter(client => 
                !conflicts.some(conflict => conflict.id === client.id)
            );
        }

        while (syncQueue.length > 0) {
            const client = syncQueue.shift();
            const { id, name, email, job, rate, isActive, version } = client;

            await query(
                `INSERT INTO clients_td (id, name, email, job, rate, isActive, version, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
                 ON CONFLICT (id)
                 DO UPDATE SET 
                     name = EXCLUDED.name,
                     email = EXCLUDED.email,
                     job = EXCLUDED.job,
                     rate = EXCLUDED.rate,
                     isActive = EXCLUDED.isActive,
                     version = EXCLUDED.version + 1,
                     updated_at = CURRENT_TIMESTAMP`,
                [id, name, email, job, rate, isActive, version]
            );
            console.log(`Syncing client: ${id}`);
            
        }
    } catch (error) {
        console.error('Error processing sync queue:', error);
    }
};


