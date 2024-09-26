// Function to create push notification jobs
function createPushNotificationsJobs(jobs, queue) {
  // Check if jobs is an array
  if (!Array.isArray(jobs)) {
    throw new Error('Jobs is not an array');
  }

  // Iterate over each job in the jobs array
  jobs.forEach((jobData) => {
    // Create a job in the push_notification_code_3 queue
    const job = queue.create('push_notification_code_3', jobData)
      .save((err) => {
        if (err) {
          console.error('Error creating job:', err);
        } else {
          console.log(`Notification job created: ${job.id}`);
        }
      });

    // Handle job completion
    job.on('complete', () => {
      console.log(`Notification job ${job.id} completed`);
    });

    // Handle job failure
    job.on('failed', (errorMessage) => {
      console.log(`Notification job ${job.id} failed: ${errorMessage}`);
    });

    // Handle job progress
    job.on('progress', (progress) => {
      console.log(`Notification job ${job.id} ${progress}% complete`);
    });
  });
}

// Export the function for use in other modules
module.exports = createPushNotificationsJobs;
