// clientService.js
//import db from '../db.js';

// export const processChanges = async (changes) => {
//     for (const client of changes.clients_td) {
//         try {
//             if (client.sync_status === 'deleted') {
//                 await db.query(
//                     `DELETE FROM clients_td WHERE id = $1`,
//                     [client.id]
//                 );
//             } else {
//                 // Check if record exists
//                 const existingRecord = await db.query(
//                     `SELECT id FROM clients_td WHERE id = $1`,
//                     [client.id]
//                 );

//                 if (existingRecord.rows.length === 0) {
//                     // Insert new record
//                     await db.query(
//                         `INSERT INTO clients_td (id, name, email, job, rate, isActive, version, updated_at, sync_status)
//                          VALUES ($1, $2, $3, $4, $5, $6, 1, CURRENT_TIMESTAMP, 'synced')`,
//                         [client.id, client.name, client.email, client.job, client.rate, client.isactive]
//                     );
//                 } else {
//                     // Update existing record
//                     await db.query(
//                         `UPDATE clients_td SET
//                          name = $1, email = $2, job = $3, rate = $4, isActive = $5, version = version + 1, 
//                          updated_at = CURRENT_TIMESTAMP, sync_status = 'synced'
//                          WHERE id = $6`,
//                         [client.name, client.email, client.job, client.rate, client.isactive, client.id]
//                     );
//                 }
//             }
//         } catch (error) {
//             console.error(`Error processing change for client ${client.id}:`, error);
//             throw error;
//         }
//     }
// };

import db from '../db.js';

export const processChanges = async (changes) => {
    for (const client of changes.clients_td) {
        try {
            if (client.sync_status === 'deleted') {
                // Add to deleted_records before deleting
                await db.query(
                    `INSERT INTO deleted_records (table_name, record_id) 
                     VALUES ($1, $2)`,
                    ['clients_td', client.id]
                );
                await db.query(
                    `DELETE FROM clients_td WHERE id = $1`,
                    [client.id]
                );
            } else {
                const existingRecord = await db.query(
                    `SELECT id FROM clients_td WHERE id = $1`,
                    [client.id]
                );
                if (existingRecord.rows.length === 0) {
                    await db.query(
                        `INSERT INTO clients_td (id, name, email, job, rate, isActive, version, updated_at, sync_status)
                         VALUES ($1, $2, $3, $4, $5, $6, 1, CURRENT_TIMESTAMP, 'synced')`,
                        [client.id, client.name, client.email, client.job, client.rate, client.isactive]
                    );
                } else {
                    await db.query(
                        `UPDATE clients_td SET
                         name = $1, email = $2, job = $3, rate = $4, isActive = $5, version = version + 1, 
                         updated_at = CURRENT_TIMESTAMP, sync_status = 'synced'
                         WHERE id = $6`,
                        [client.name, client.email, client.job, client.rate, client.isactive, client.id]
                    );
                }
            }
        } catch (error) {
            console.error(`Error processing change for client ${client.id}:`, error);
            throw error;
        }
    }
};

export const getChangesSince = async (lastPulledAt) => {
    const clientChanges = await db.query(
        `SELECT * FROM clients_td WHERE updated_at > to_timestamp($1)`,
        [lastPulledAt / 1000]
    );
    const deletedChanges = await db.query(
        `SELECT record_id FROM deleted_records 
         WHERE table_name = 'clients_td' 
         AND deleted_at > to_timestamp($1)`,
        [lastPulledAt / 1000]
    );

    return {
        clients_td: clientChanges.rows,
        deleted_records: deletedChanges.rows.map(row => ({ id: row.record_id }))
    };
};


