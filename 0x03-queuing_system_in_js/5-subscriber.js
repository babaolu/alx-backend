import { createClient } from 'redis';

const client = createClient();

client.on('connect', () => {
  console.log('Redis client connected to the server');
});

client.on('error', (err) => {
  console.log(`Redis client not connected to the server: ${err.message}`);
});

// Subscribe to the 'holberton school channel'
client.subscribe('holberton school channel', (err) => {
  if (err) {
    console.error(`Failed to subscribe: ${err.message}`);
  }
});

// Handle incoming messages
client.on('message', (channel, message) => {
  console.log(message);

  // Unsubscribe and quit if the message is 'KILL_SERVER'
  if (message === 'KILL_SERVER') {
    client.unsubscribe('holberton school channel', () => {
      client.quit();
    });
  }
});
