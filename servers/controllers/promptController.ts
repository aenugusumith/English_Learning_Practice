import { Request, Response } from 'express';
import {pool} from '../db';
import { generateSpeakingPrompt } from '../services/generatePrompt';

export const getDailyPrompt = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM daily_prompts WHERE created_at::date = CURRENT_DATE LIMIT 1`
    );

    if (result.rows.length > 0) {
      return res.json({ prompt: result.rows[0].prompt });
    }

    const newPrompt = await generateSpeakingPrompt();

    
    const insertResult = await pool.query(
      `INSERT INTO daily_prompts (prompt) VALUES ($1) RETURNING *`,
      [newPrompt]
    );

    res.json({ prompt: insertResult.rows[0].prompt });
  } catch (error: any) {
  console.error('❌ Daily Prompt Error:', error.message);
  res.status(500).json({ error: 'Failed to get daily prompt' });
}
};
