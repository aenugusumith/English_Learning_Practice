import React, { useState } from 'react';

const ReminderForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/userRem/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reminder_time: time,
        }),
      });

      if (response.ok) {
        setMessage('✅ Reminder saved!');
        setEmail('');
        setTime('');
      } else {
        const errorData = await response.json();
        setMessage(`❌ Error: ${errorData.error || 'Failed to save reminder.'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Network error. Please try again later.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>📧 Daily Reminder</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
        </div>
        <div>
          <label>Reminder Time:</label><br />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Save Reminder</button>
      </form>
      {message && <p style={{ marginTop: '20px' }}>{message}</p>}
    </div>
  );
};

export default ReminderForm;
