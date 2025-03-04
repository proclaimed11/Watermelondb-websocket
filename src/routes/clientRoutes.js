import { Router } from 'express';
import { pullChanges, pushChanges } from '../controller/clientController.js';

const router = Router();

// WatermelonDB Sync Endpoints
router.post('/api/sync/pull', pullChanges); // Pull changes since last sync
router.post('/api/sync/push', pushChanges); // Push changes from the client

export default router;
