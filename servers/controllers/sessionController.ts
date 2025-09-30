import { Request, Response } from 'express';
import { pool } from '../db';
import { generateFeedback } from '../services/openaiService';

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  return words.reduce((count, word) => {
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return count + (syllables ? syllables.length : 1);
  }, 0);
}


function calculateFKScore(transcript: string): number {
  const wordCount = transcript.trim().split(/\s+/).length || 1;
  const sentenceCount = transcript.split(/[.!?]+/).filter(Boolean).length || 1;
  const syllableCount = countSyllables(transcript);
  return Number((0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59).toFixed(2));
}


function extractScore(feedback: string, label: string): string | null {
  const match = feedback.match(new RegExp(`${label}:\s*([\w\d/]+)`, 'i'));
  return match ? match[1] : null;
}

// Extract fluency score from feedback
export const extractFluencyScore = (feedback: string): number => {
  const scoreMatch = feedback.match(/Fluency Score:\s*(\d+(?:\.\d+)?)/i);
  return scoreMatch ? parseFloat(scoreMatch[1]) : 0;
};

// Extract CEFR level from feedback
export const extractCEFRLevel = (feedback: string): string => {
  const levelMatch = feedback.match(/CEFR Level:\s*([ABC][12])/i);
  return levelMatch ? levelMatch[1].toUpperCase() : 'Unknown';
};

export const createSession = async (req: Request, res: Response) => {
  const { transcript, prompt, durationSeconds } = req.body;
  if (!transcript) return res.status(400).json({ error: 'Transcript is required' });


  try {
    const feedback = await generateFeedback(transcript);
    const fluencyScore = extractScore(feedback, 'Fluency Score');
    const readability_score = calculateFKScore(transcript);
    const cefrLevel = extractCEFRLevel(feedback);
    const wordCount = transcript.trim().split(/\s+/).length;
    const sessionLengthInMinutes = durationSeconds ? durationSeconds / 60 : 1;
    const wpm = wordCount / sessionLengthInMinutes;



    const result = await pool.query(
      `INSERT INTO practice_sessions
(transcript, feedback, fluency_score, readability_score, prompt, cefr_level, wpm)
VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [transcript, feedback, fluencyScore, readability_score, prompt, cefrLevel, wpm]
    );


    res.status(201).json({ message: 'Session saved ✅', session: result.rows[0] });
  } catch (err) {
    console.error('❌ Error saving session:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllSessions = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM practice_sessions ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};
