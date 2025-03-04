import db from "../db.js"
// conflictMiddleware.js
export const detectConflicts = async (req, res, next) => {
    const { changes } = req.body;
    try {
        for (const client of changes.clients_td) {
            const result = await db.query(
                `SELECT version FROM clients_td WHERE id = $1`,
                [client.id]
            );
            
            if (result.rows.length > 0 && client.version < result.rows[0].version) {
                return res.status(409).json({
                    error: 'Conflict detected',
                    clientId: client.id,
                });
            }
        }
        next();
    } catch (error) {
        console.error('Error in conflict detection:', error);
        res.status(500).json({
            error: 'Error checking for conflicts',
            details: error.message
        });
    }
};
