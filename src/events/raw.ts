import { Event } from 'klasa';
import config from '../../config';
import { Message, TextChannel } from 'discord.js';
import fetch from 'node-fetch';

const REACTIONS = {
  CHECK: '✅',
  STOP: '🛑',
  STAR: '⭐',
  APPROVE_DENY_FAVORITE: ['✅', '🛑', '⭐'],
};

export default class extends Event {
  async run(data: any): Promise<null> {
    const reaction = data.d;

    // If it is not message reaction add or the channel is not one of the editing channels or the user is not approved cancel out.
    if (
      data.t !== 'MESSAGE_REACTION_ADD' ||
      reaction.channel_id !== config.submitChannelID ||
      !REACTIONS.APPROVE_DENY_FAVORITE.includes(reaction.emoji.name)
    )
      return null;

    // Get the channel from the discord then fetch the message from that channel. If the message can not be fetched cancel out
    const channel = this.client.channels.get(
      reaction.channel_id
    ) as TextChannel;

    const member =
      channel.guild.members.get(reaction.user_id) ||
      (await channel.guild.members.fetch(reaction.user_id));
    if (!member || member.user.bot) return null;

    let memberHasApprovedRole = false;
    for (const roleID of config.approvedRoleIDs)
      if (member.roles.has(roleID)) memberHasApprovedRole = true;

    if (!memberHasApprovedRole) return null;

    const message = await channel.messages
      .fetch(reaction.message_id)
      .catch((): null => null);
    if (!message) return null;

    // Find the channel to send to based on if the message was approved or rejected and send to that channel
    const channelID =
      REACTIONS.STOP === reaction.emoji.name
        ? config.rejectedChannelID
        : config.approvedChannelID;
    const approvedOrRejectedChannel = channel.guild.channels.get(
      channelID
    ) as TextChannel;

    const messageMoved = (await approvedOrRejectedChannel.send(
      message.embeds.length
        ? message.embeds[0]
        : 'Invalid embedded message reacted upon.'
    )) as Message;
    // If the message was moved delete it
    if (messageMoved && message.deletable) message.delete();
    // Rejected so dont add to databse
    if (REACTIONS.STOP === reaction.emoji.name) return null;

    const embed = message.embeds[0];
    const json = {
      messageID: messageMoved.id,
      channelID,
      author: embed.description || '',
      category: embed.footer.text ? embed.footer.text.toLowerCase() : '',
      featured: REACTIONS.STAR === reaction.emoji.name,
      path: embed.footer.text ? embed.footer.text.toLowerCase() : '',
      image: (embed.image && embed.image.proxyURL) || '',
      link: embed.url || '',
      title: embed.title ? embed.title.substring(0, 30) : '',
      timestamp: Date.now(),
    };

    // First check if this message already has a object in the database and cancel OR create a post in the posts table.
    const existsInDB = await this.client.providers.default.has(
      'posts',
      message.id
    );
    if (!existsInDB) {
      // Update the database with the new data
      await this.client.providers.default.create('posts', message.id, json);
      // Tell netlify to rebuild the website
      await fetch(config.netlifyUpdateWebhook, {
        method: 'POST',
      });
    }

    return null;
  }
}

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
