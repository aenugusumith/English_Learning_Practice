import express from 'express';
import { getPronunciationFeedback } from '../controllers/feedbackController';


const router = express.Router();


router.post('/pronunciation', getPronunciationFeedback);


export default router;


