import { Event } from 'klasa';
import config from '../../config';
import { TextChannel } from 'discord.js';

const allowedChannels = [
  '551475973908856882',
  '551475957773631523',
  '551476016435036160',
  '551476033337950227',
];

export default class extends Event {
  async run(data: any): Promise<null> {
    const reaction = data.d;
    // If it is not message reaction add or the channel is not one of the editing channels or the user is not approved cancel out.
    if (
      data.t !== 'MESSAGE_REACTION_ADD' ||
      !allowedChannels.includes(reaction.channel_id) ||
      !config.approvedUserIDs.includes(reaction.user_id)
    )
      return null;

    // Get the channel from the discord then fetch the message from that channel. If the message can not be fetched cancel out
    const channel = this.client.channels.get(reaction.channel_id) as TextChannel;

    const message = await channel.messages
      .fetch(reaction.message_id)
      .catch((): null => null);
    if (!message) return null;

    // Create a placeholder and check if the JSON can be parsed in a try catch to avoid any errors from throwing and handle it properly. If json is valid assign it to the placeholder
    let json;
    try {
      json = JSON.parse(message.content);
    } catch (error) {
      this.client.emit('error', `Invalid JSON found.\n\n${error}`);
    }

    // If the json was invalid for whatever reason cancel out.
    if (!json) return null;
    // Send a post request to the api for the new post

    return null;
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
