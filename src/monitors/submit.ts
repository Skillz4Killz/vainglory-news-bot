import { Monitor, MonitorStore, KlasaClient, KlasaMessage } from 'klasa';
import { Message, TextChannel } from 'discord.js';

const allowedChannels = [
  { name: 'art', id: '551475973908856882' },
  { name: 'guides', id: '551475957773631523' },
  { name: 'esports', id: '551476016435036160' },
  { name: 'tools', id: '551476033337950227' },
];

const REACTIONS = {
  CHECK: '✅',
  STOP: '🛑',
  APPROVE_DENY: ['✅', '🛑'],
};

export default class extends Monitor {
  constructor(
    client: KlasaClient,
    store: MonitorStore,
    file: string[],
    directory: string
  ) {
    super(client, store, file, directory, {
      ignoreOthers: false,
      ignoreEdits: false,
    });
  }

  async run(message: KlasaMessage): Promise<null> {
    if (message.channel.id !== '548555325956161547') return null;

    // Create a placeholder and check if the JSON can be parsed in a try catch to avoid any errors from throwing and handle it properly. If json is valid assign it to the placeholder
    let json: any;
    try {
      json = JSON.parse(message.content);
    } catch (error) {
      (message.guild.channels.get('551584766311268355') as TextChannel).send(
        `${
          message.author
        }, there was some error processing your request to submit content. Please review the error below and try again. If you still need help please send a **.mail** to get help.\n\n${error}`
      );
      message.client.emit('error', `Invalid JSON found.\n\n${error}`);
    }

    if (!json) return null;

    const channel = message.guild.channels.get(
      allowedChannels.find((c) => c.name === json.category)!.id
    ) as TextChannel;
    if (!channel) return null;

    const sentMessage = (await channel
      .send(message.content)
      .catch((): null => null)) as Message;
    if (!sentMessage) return null;

    for (const reaction of REACTIONS.APPROVE_DENY)
      await sentMessage.react(reaction);

    return null;
  }
}
