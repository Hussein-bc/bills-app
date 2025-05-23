// reminder-job.ts
import fetch from 'node-fetch';

fetch('http://localhost:3000/api/reminders')
  .then((res) => res.json())
  .then((data) => {
    console.log('Reminder sent:', data);
  })
  .catch((err) => {
    console.error('Error sending reminder:', err.message);
  });
