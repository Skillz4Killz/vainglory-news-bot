import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';
import config from '../../config';

export default class extends Command {
	constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			permissionLevel: 6,
			description: 'Rebuild the website',
		});
	}

	async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const rebuilt = await fetch(config.netlifyUpdateWebhook, { method: 'POST' }).catch((error: any) => {
			this.client.console.error(error);
			return null;
		});

		return message.send(rebuilt ? 'The website has begun rebuilding.' : 'The rebuild was not successful.')
	}
}
