import { Router } from 'express';

const router = Router();

router.get('/run-migration', async (req, res) => {
  // Migration has been completed manually
  // This endpoint is kept for compatibility but no longer runs migrations
  res.json({ 
    success: true, 
    message: 'Database tables already created. Migration endpoint disabled.',
    note: 'Tables were created manually via direct PostgreSQL connection.'
  });
});

export default router;
