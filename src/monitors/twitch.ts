// Rebuild the website when the twitch streamer goes live or offline.
import { KlasaClient, KlasaMessage, MonitorStore, Monitor } from 'klasa';
import config from '../../config';
import fetch from 'node-fetch';

export default class extends Monitor {
  constructor(
    client: KlasaClient,
    store: MonitorStore,
    file: string[],
    directory: string
  ) {
    super(client, store, file, directory, {
      ignoreWebhooks: false,
      ignoreOthers: false,
      ignoreBots: false,
    });
  }

  async run(message: KlasaMessage): Promise<null> {
    if (message.channel.id !== config.twitchChannelID) return null;

    const embed = message.embeds[0];
    if (!embed) return null;

    // if it is offline remove the streamer from the page
    if (embed.description.startsWith('OFFLINE:')) {
      // Remove the streamers post from the posts database
      await this.client.providers.default.delete('posts', embed.author.name);
      // Tell netlify to rebuild the website
      await fetch(config.netlifyUpdateWebhook, {
        method: 'POST',
      });

      this.client.emit('log', `Twitch streamer being removed. ${embed.author.name}`);
      return null;
    }

    // Add the streamer to the page
    const json = {
      messageID: message.id,
      channelID: message.channel.id,
      author: embed.author.name || '',
      category: 'entertainment',
      featured: false,
      stream: true,
      path: 'entertainment',
      image: 'https://i.imgur.com/OgjCear.jpg',
      link: embed.url || '',
      title: embed.title ? embed.title.substring(0, 30) : '',
      timestamp: Date.now(),
    };

    // Update the database with the new data
    await this.client.providers.default.create('posts', embed.author.name, json);
    // Tell netlify to rebuild the website
    await fetch(config.netlifyUpdateWebhook, {
      method: 'POST',
    });

    this.client.emit('log', `Twitch streamer went live. ${embed.author.name}`)
    return null;
  }
}
