import express from 'express';
import { createSession, getAllSessions } from '../../servers/controllers/sessionController';

const router = express.Router();

router.post('/sessions', createSession);
router.get('/sessions', getAllSessions);


export default router;
