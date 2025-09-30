import express from 'express';
import { getDailyPrompt } from '../controllers/promptController';

const router = express.Router();

router.get('/', getDailyPrompt);

export default router;
