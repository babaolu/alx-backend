// Import required modules
const kue = require('kue');

const queue = kue.createQueue();

// Define an array for blacklisted phone numbers
const blacklistedNumbers = [
  '4153518780',
  '4153518781',
];

// Function to send notification
function sendNotification(phoneNumber, message, job, done) {
  // Track job progress
  job.progress(0, 100);

  // Check if the phone number is blacklisted
  if (blacklistedNumbers.includes(phoneNumber)) {
    // Fail the job with an error
    done(new Error(`Phone number ${phoneNumber} is blacklisted`));
  }

  // Track progress to 50%
  job.progress(50);

  // Log sending notification
  console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);

  // Simulate some asynchronous operation (like sending a notification)
  setTimeout(() => {
    // Mark job as complete
    done();
  }, 2000); // Simulates a delay of 2 seconds
}

// Create a job processor for the push_notification_code_2 queue
queue.process('push_notification_code_2', 2, (job, done) => {
  const { phoneNumber, message } = job.data;
  sendNotification(phoneNumber, message, job, done);
});

// Handle job events
queue.on('job complete', (id) => {
  console.log(`Job ${id} completed`);
}).on('job failed', (id, errorMessage) => {
  console.log(`Job ${id} failed: ${errorMessage}`);
});
