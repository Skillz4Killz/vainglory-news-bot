"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const klasa_1 = require("klasa");
class default_1 extends klasa_1.Command {
    constructor(client, store, file, directory) {
        super(client, store, file, directory, {
            runIn: ['text', 'dm'],
            aliases: [],
            permissionLevel: 0,
            description: 'Save an category to the database so you dont have to provide an author every time you submit content.',
            quotedStringSupport: true,
            usage: '[art|guides|esports|tools]',
        });
    }
    async run(message, [category]) {
        const savedCategory = message.author.settings.category;
        if (!category)
            return message.send(message.author.settings.category
                ? `You did not provide any valid category to save in the database. **${savedCategory}** is currently saved in the database as your default category.`
                : 'You do not currently have a category saved in the database. Please type **.category NAME** to save a default name into the database. Replace NAME with the category you would like to use.');
        const { errors } = await message.author.settings.update('category', category);
        if (errors.length)
            this.client.emit('error', errors.join('\n'));
        return message.send(errors.length
            ? 'There was some errors in saving your name. Please try again.'
            : `You have saved **${category}** into the database as your default category. You will no longer be asked to provide a author when submitting content.`);
    }
}
exports.default = default_1;
