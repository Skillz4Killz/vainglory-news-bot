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
        'Save an category to the database so you dont have to provide a category every time you submit content.',
      quotedStringSupport: true,
      usage: '[art|guides|esports|tools]',
      // usageDelim: ' ',
    });
  }

  async run(
    message: KlasaMessage,
    [category]: [string | null]
  ): Promise<KlasaMessage | KlasaMessage[]> {
    const savedCategory = (message.author.settings as UserSettings).category;
    if (!category)
      return message.send(
        (message.author.settings as UserSettings).category
          ? `You did not provide any valid category to save in the database. **${savedCategory}** is currently saved in the database as your default category.`
          : 'You do not currently have a category saved in the database. Please type **.category NAME** to save a default name into the database. Replace NAME with the category you would like to use.'
      );

    const { errors } = await message.author.settings.update(
      'category',
      category
    );
    if (errors.length) this.client.emit('error', errors.join('\n'));

    return message.send(
      errors.length
        ? 'There was some errors in saving your name. Please try again.'
        : `You have saved **${category}** into the database as your default category. You will no longer be asked to provide a author when submitting content.`
    );
  }
}
