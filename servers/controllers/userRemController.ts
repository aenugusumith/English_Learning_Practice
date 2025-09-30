import { Request, Response } from 'express';
import { pool } from '../db';

export const setReminderTime = async (req: Request, res: Response) => {
  const { email, reminderTime } = req.body;

  try {
    await pool.query(
      'INSERT INTO reminders (email, reminder_time) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET reminder_time = $2',
      [email, reminderTime]
    );
    res.status(200).json({ message: 'Reminder time saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save reminder time' });
  }
};
