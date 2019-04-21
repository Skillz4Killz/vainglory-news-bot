// Add reactions to the messages sent to all messages sent in the #pending-approval channel

import { KlasaClient, KlasaMessage, MonitorStore, Monitor } from 'klasa';
import config from '../../config';

const REACTIONS = ['✅', '🛑', '⭐'];

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
      ignoreSelf: false,
    });
  }

  async run(message: KlasaMessage): Promise<boolean | null> {
    // Don't want the monitor doing anything on any channel except the #pending-approval channel
    if (message.channel.id !== config.submitChannelID) return null;
    // Await so that the reactions are always in a nice clean order
    for (const reaction of REACTIONS)
      await message
        .react(reaction)
        .catch((error) => this.client.emit('error', error));
    // The monitor has ran successfully
    return this.client.emit(
      'log',
      `Successfully ran the Add Reactions monitor on message ID ${message.id}`
    );
  }
}
