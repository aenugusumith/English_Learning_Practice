import cron from 'node-cron';
import { sendDailyReminder } from '../services/emailService';
import {pool} from '../db';

// Cron expression '0 9 * * *' means 9:00 AM every day.

// '*/5 * * * *' = every 5 minutes (useful for testing).

cron.schedule('*/10 * * * *', async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // 'HH:MM'

  try {
    const result = await pool.query(
      "SELECT email FROM reminders WHERE to_char(reminder_time, 'HH24:MI') = $1",
      [currentTime]
    );

    for (const row of result.rows) {
      await sendDailyReminder(row.email, 'Time for your daily English speaking practice!');
    }

    if (result.rows.length) {
      console.log(`📬 Sent ${result.rows.length} reminder(s) at ${currentTime}`);
    }
  } catch (err) {
    console.error('❌ Error in cron job:', err);
  }
});
