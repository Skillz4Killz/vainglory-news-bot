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
}).login(config.botToken);
