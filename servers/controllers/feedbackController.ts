// controllers/feedbackController.ts
import { Request, Response } from 'express';
import { generatePronunciationFeedback } from '../services/openaiService';


export const getPronunciationFeedback = async (req: Request, res: Response) => {
const { transcript } = req.body;
if (!transcript) return res.status(400).json({ error: 'Transcript is required' });


try {
const feedback = await generatePronunciationFeedback(transcript);
res.json({ feedback });
} catch (error) {
console.error('Pronunciation Feedback Error:', error);
res.status(500).json({ error: 'Failed to generate pronunciation feedback' });
}
};