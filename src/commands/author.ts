import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { UserSettings } from '../lib/types/klasa';

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
      description:
        'Save an author name to the database so you dont have to provide an author every time you submit content.',
      quotedStringSupport: true,
      usage: '[authorName:string]',
      // usageDelim: ' ',
    });
  }

  async run(
    message: KlasaMessage,
    [authorName]: [string]
  ): Promise<KlasaMessage | KlasaMessage[]> {
    const savedName = (message.author.settings as UserSettings).authorName;
    if (!authorName)
      return message.send(
        (message.author.settings as UserSettings).authorName
          ? `**${savedName}** is currently saved in the database as your default author name.`
          : 'You do not currently have a author name saved in the database. Please type **.author NAME** to save a default name into the database. Replace NAME with the name you would like to use.'
      );

    const { errors } = await message.author.settings.update(
      'authorName',
      authorName
    );
    if (errors.length) this.client.emit('error', errors.join('\n'));

    return message.send(
      errors.length
        ? 'There was some errors in saving your name. Please try again.'
        : `You have saved **${authorName}** into the database as your default author name. You will no longer be asked to provide a author when submitting content.`
    );
  }
}
