"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const klasa_1 = require("klasa");
const config_1 = require("../../config");
const allowedChannels = [
    '551475973908856882',
    '551475957773631523',
    '551476016435036160',
    '551476033337950227',
];
class default_1 extends klasa_1.Event {
    async run(data) {
        const reaction = data.d;
        if (data.t !== 'MESSAGE_REACTION_ADD' ||
            !allowedChannels.includes(reaction.channel_id) ||
            !config_1.default.approvedUserIDs.includes(reaction.user_id))
            return null;
        const channel = this.client.channels.get(reaction.channel_id);
        const message = await channel.messages
            .fetch(reaction.message_id)
            .catch(() => null);
        if (!message)
            return null;
        let json;
        try {
            json = JSON.parse(message.content);
        }
        catch (error) {
            this.client.emit('error', `Invalid JSON found.\n\n${error}`);
        }
        if (!json)
            return null;
        return null;
    }
}
exports.default = default_1;
;
