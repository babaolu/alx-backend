const express = require('express');
const redis = require('redis');
const { promisify } = require('util');
const kue = require('kue');

const app = express();
const port = 1245;

// Redis client setup
const redisClient = redis.createClient();
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

// Kue queue setup
const queue = kue.createQueue();

// Initialize available seats
let reservationEnabled = true;
const initialAvailableSeats = 50;

// Function to reserve seats
async function reserveSeat(number) {
  await setAsync('available_seats', number);
}

// Function to get current available seats
async function getCurrentAvailableSeats() {
  const availableSeats = await getAsync('available_seats');
  return availableSeats ? parseInt(availableSeats, 10) : 0;
}

// Set initial available seats when the application starts
(async () => {
  await reserveSeat(initialAvailableSeats);
})();

// Route to get available seats
app.get('/available_seats', async (req, res) => {
  const availableSeats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats: availableSeats.toString() });
});

// Route to reserve a seat
app.get('/reserve_seat', async (req, res) => {
  if (!reservationEnabled) {
    res.json({ status: 'Reservations are blocked' });
  }

  const job = queue.create('reserve_seat').save((err) => {
    if (err) {
      res.json({ status: 'Reservation failed' });
    }
    res.json({ status: 'Reservation in process' });
  });

  // Handle job completion
  job.on('complete', () => {
    console.log(`Seat reservation job ${job.id} completed`);
  });

  // Handle job failure
  job.on('failed', (errorMessage) => {
    console.log(`Seat reservation job ${job.id} failed: ${errorMessage}`);
  });
});

// Route to process the queue
app.get('/process', async (req, res) => {
  res.json({ status: 'Queue processing' });

  queue.process('reserve_seat', async (job, done) => {
    try {
      const currentAvailableSeats = await getCurrentAvailableSeats();
      const newAvailableSeats = currentAvailableSeats - 1;
      await reserveSeat(newAvailableSeats);

      if (newAvailableSeats === 0) {
        reservationEnabled = false; // Disable reservations if no seats are left
      }

      done(); // Mark the job as complete
    } catch (error) {
      done(new Error('Not enough seats available'));
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
