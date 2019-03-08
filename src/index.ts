import { Client, KlasaClient } from 'klasa';
import config from '../config';

KlasaClient.defaultUserSchema
  .add('authorName', 'string')
  .add('category', 'string');

new Client({
  commandEditing: true,
  prefix: '!',
  readyMessage: () => `Bot is Ready!`,
  typing: true,
  providers: {
    default: 'mongodb',
    mongodb: {
      connectionString: config.mongoDBLogin,
    },
  },
}).login(config.botToken);

// Place outside of any other listener in your main file
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});
