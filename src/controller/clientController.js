import { getChangesSince, processChanges } from '../services/clientService.js';

export const pullChanges = async (req, res) => {
    try {
        const { lastPulledAt } = req.body;

        // Fetch records changed since lastPulledAt
        const changes = await getChangesSince(lastPulledAt);
        const currentTime = Date.now();

        res.json({
            changes,
            timestamp: currentTime, // Used for future sync
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to pull changes', details: error.message });
    }
};

export const pushChanges = async (req, res) => {
    try {
        const { changes } = req.body;

        // Process client changes
        await processChanges(changes);

        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to push changes', details: error.message });
    }
};
