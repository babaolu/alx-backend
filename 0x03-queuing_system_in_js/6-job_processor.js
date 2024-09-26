const kue = require('kue');

const queue = kue.createQueue();

// Create a function to add a job to the queue
function createNotificationJob(phoneNumber, message) {
  // Create the job data object
  const jobData = {
    phoneNumber,
    message,
  };

  // Create a job in the 'push_notification_code' queue
  const job = queue.create('push_notification_code', jobData)
    .save((err) => {
      if (err) {
        console.error('Error creating job:', err);
      } else {
        console.log(`Notification job created: ${job.id}`);
      }
    });

  // Handle job completion
  job.on('complete', () => {
    console.log('Notification job completed');
  });

  // Handle job failure
  job.on('failed', (errorMessage) => {
    console.log(`Notification job failed: ${errorMessage}`);
  });
}

createNotificationJob('+1234567890', 'Hello, this is a test notification!');
