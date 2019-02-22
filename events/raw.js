const { Event } = require('klasa');
const config = require('../config');

module.exports = class extends Event {
  async run(data) {
    if (
      data.t !== 'MESSAGE_REACTION_ADD' ||
      data.d.channel_id !== config.submitChannelID ||
      config.approvedUserIDs.includes(data.d.user_id)
    )
      return null;
    console.log(data);

    const reaction = data.d;

    const channel = this.client.channels.get(data.d.channel_id);

    const message = await channel.messages
      .fetch(data.d.message_id)
      .catch(() => null);
    if (!message) return null;

    // Create a placeholder and check if the JSON can be parsed in a try catch to avoid any errors from throwing and handle it properly. If json is valid assign it to the placeholder
    let json;
    try {
      const jsonTest = JSON.parse(message.content);
      json = jsonTest;
    } catch (error) {
      this.client.console.warn(`Invalid JSON found.\n\n${error}`);
    }

    // If the json was invalid for whatever reason cancel out.
    if (!json) return null;
    // Update db with the message content.
  }
};

// {
// 	t: 'MESSAGE_REACTION_ADD',
// 	s: 5,
// 	op: 0,
// 	d: {
// 		user_id: '130136895395987456',
// 		message_id: '548559863152771073',
// 		emoji: { name: '❤', id: null, animated: false },
// 		channel_id: '548555325956161547',
// 		guild_id: '540960656451698728',
// 	},
// };
