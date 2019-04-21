import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { TextChannel, MessageEmbed, Message } from 'discord.js';
import { UserSettings } from '../lib/types/klasa';
import config from '../../config';

const questions = [
  {
    text: 'What name would you like to use as the author of this submission?',
    name: 'authorName',
  },
  {
    text: [
      'What would you like to add as the category for this submission?',
      '',
      '**Valid Categories:**',
      '',
      '`Art:` If the content is fanart or memes related to Vainglory',
      '`Guides:` If the content is a guide to help players learn something including articles or videos.',
      '`Entertainment:` If you are promoting video content or a tournament supported by SEMC',
      '`Tools:` If you are submitting a cool new project that should be listed for players. (Not to be used for news about those projects)',
    ].join('\n'),
    name: 'category',
    options: ['Entertainment', 'art', 'guides', 'tools'],
  },
  {
    text: 'What would you like to add as the link for this submission?',
    name: 'link',
  },
  {
    text: 'What would you like to add as the image for this submission?',
    name: 'image',
  },
  {
    text: 'What would you like to add as the title for this submission? MAX 30 CHARACTERS WILL BE USED ON WEBSITE!',
    name: 'title',
  },
];

export default class extends Command {
  constructor(
    client: KlasaClient,
    store: CommandStore,
    file: string[],
    directory: string
  ) {
    super(client, store, file, directory, {
      runIn: ['text', 'dm'],
      aliases: [],
      permissionLevel: 0,
      description: 'Submit your content to be processed.',
      quotedStringSupport: true,
      cooldown: 120,
      // usage: '',
      // usageDelim: ' ',
    });
  }

  async run(
    message: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const responses: { [key: string]: string } = {};

    for (const question of questions) {
      const savedData = (message.author.settings as UserSettings)[
        question.name
      ];
      if (savedData) {
        responses[question.name] = savedData;
        continue;
      }

      const response = (await this.ask(
        message,
        question.text,
        question.options
      )) as Message;
      if (!response) return null;

      if (question.name === 'title' && !response.content)
        throw new MessageEmbed()
          .setAuthor(
            message.member.displayName,
            message.author.displayAvatarURL()
          )
          .setDescription('Invalid response given for the title')
          .setColor('RED');
      responses[question.name] =
        question.name === 'image' && response.attachments.size
          ? response.attachments.first().url
          : response.content;
    }

    const channel = message.guild.channels.get(
      config.submitChannelID
    ) as TextChannel;
    if (!channel) return null;

    const responseEmbed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(message.member.displayName, message.author.displayAvatarURL())
      .setDescription(responses.authorName)
      .setFooter(responses.category)
      .setURL(responses.link)
      .setImage(responses.image)
      .setTitle(responses.title)
      .setTimestamp();
    const sentMessage = (await channel.send(responseEmbed).catch(() => null)) as Message | null;

    if (!sentMessage) return null;
    return message.send(
      'You have successfully sent in your submission. To view your submission please check out <#548555325956161547>'
    );
  }

  async ask(message: KlasaMessage, question: string, options?: string[]) {
    const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(message.member.displayName, message.author.displayAvatarURL())
      .setDescription(question)
      .setFooter(
        'You have 5 minutes to reply. To cancel please type [C]ancel.'
      );

    await message.channel.send(embed);
    const messages = await message.channel.awaitMessages(
      (response: KlasaMessage) =>
        response.author === message.author &&
        (options && options.length ? options.includes(response.content.toLowerCase()) : true),
      { time: 300000, max: 1 }
    );
    if (messages.size === 0) return null;
    const responseMessage = messages.first();
    if (
      ['cancel', 'c', 'n', 'no'].includes(responseMessage.content.toLowerCase())
    ) {
      await message.channel.send(
        embed
          .setDescription('You have cancelled your submission.')
          .setFooter('')
      );
      return null;
    }

    return responseMessage || null;
  }
}
