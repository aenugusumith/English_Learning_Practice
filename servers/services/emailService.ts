// services/emailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // you can use 'smtp.ethereal.email' or any SMTP host
  auth: {
    user: process.env.EMAIL_USER!, // your email
    pass: process.env.EMAIL_PASS!, // your app password (not normal password)
  },
});

/**
 * Send a daily reminder email to the user
 * @param toEmail recipient's email
 * @param message email body
 */
export const sendDailyReminder = async (toEmail: string, message: string) => {
  await transporter.sendMail({
    from: `"English Coach" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🗓️ Your Daily Speaking Reminder!',
    text: message,
  });
  console.log(`✅ Reminder email sent to ${toEmail}`);
};
