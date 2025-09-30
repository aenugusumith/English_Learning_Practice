import { Router } from 'express';
import { pool } from '../db';
import { sendDailyReminder } from '../services/emailService';

const router = Router();

// GET /api/userRem/reminders?email=janum@example.com
router.get('/reminders', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM reminders WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No reminder found for this email.' });
    }

    res.status(200).json(result.rows[0]);

  } catch (error: any) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: 'Failed to fetch reminder', message: error.message });
  }
});

// POST /api/userRem/reminders
router.post('/reminders', async (req, res) => {
  const { email, reminder_time } = req.body;

  if (!email || !reminder_time) {
    return res.status(400).json({ error: 'Email and reminder_time are required.' });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO reminders (email, reminder_time)
      VALUES ($1, $2)
      ON CONFLICT (email)
      DO UPDATE SET reminder_time = EXCLUDED.reminder_time
      RETURNING *
      `,
      [email, reminder_time]
    );

    res.status(201).json({ message: 'Reminder saved successfully!', reminder: result.rows[0] });

  } catch (error: any) {
    console.error('Error saving reminder:', error);
    res.status(500).json({ error: 'Failed to save reminder', message: error.message });
  }
});

export default router;
