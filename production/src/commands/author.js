"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const klasa_1 = require("klasa");
class default_1 extends klasa_1.Command {
    constructor(client, store, file, directory) {
        super(client, store, file, directory, {
            runIn: ['text', 'dm'],
            aliases: [],
            permissionLevel: 0,
            description: 'Save an author name to the database so you dont have to provide an author every time you submit content.',
            quotedStringSupport: true,
            usage: '[authorName:string]',
        });
    }
    async run(message, [authorName]) {
        const savedName = message.author.settings.authorName;
        if (!authorName)
            return message.send(message.author.settings.authorName
                ? `**${savedName}** is currently saved in the database as your default author name.`
                : 'You do not currently have a author name saved in the database. Please type **.author NAME** to save a default name into the database. Replace NAME with the name you would like to use.');
        const { errors } = await message.author.settings.update('authorName', authorName);
        if (errors.length)
            this.client.emit('error', errors.join('\n'));
        return message.send(errors.length
            ? 'There was some errors in saving your name. Please try again.'
            : `You have saved **${authorName}** into the database as your default author name. You will no longer be asked to provide a author when submitting content.`);
    }
}
exports.default = default_1;
