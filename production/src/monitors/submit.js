"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const klasa_1 = require("klasa");
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
class default_1 extends klasa_1.Monitor {
    constructor(client, store, file, directory) {
        super(client, store, file, directory, {
            ignoreOthers: false,
            ignoreEdits: false,
        });
    }
    async run(message) {
        if (message.channel.id !== '548555325956161547')
            return null;
        let json;
        try {
            json = JSON.parse(message.content);
        }
        catch (error) {
            message.guild.channels.get('551584766311268355').send(`${message.author}, there was some error processing your request to submit content. Please review the error below and try again. If you still need help please send a **.mail** to get help.\n\n${error}`);
            message.client.emit('error', `Invalid JSON found.\n\n${error}`);
        }
        if (!json)
            return null;
        const channel = message.guild.channels.get(allowedChannels.find((c) => c.name === json.category).id);
        if (!channel)
            return null;
        const sentMessage = (await channel
            .send(message.content)
            .catch(() => null));
        if (!sentMessage)
            return null;
        for (const reaction of REACTIONS.APPROVE_DENY)
            await sentMessage.react(reaction);
        return null;
    }
}
exports.default = default_1;
