const { Client } = require('klasa');
const config = require('./config.js');

new Client({
  fetchAllMembers: false,
  prefix: '!',
  commandEditing: true,
  typing: true,
  readyMessage: (client) =>
    `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`,
}).login(config.botToken);
