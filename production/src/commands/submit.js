"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const klasa_1 = require("klasa");
const discord_js_1 = require("discord.js");
const submissionChannelID = '548555325956161547';
const questions = [
    {
        text: 'What name would you like to use as the author of this submission?',
        name: 'authorName',
    },
    {
        text: 'What would you like to add as the category for this submission?',
        name: 'category',
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
        text: 'What would you like to add as the title for this submission?',
        name: 'title',
    },
];
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
class default_1 extends klasa_1.Command {
    constructor(client, store, file, directory) {
        super(client, store, file, directory, {
            runIn: ['text', 'dm'],
            aliases: [],
            permissionLevel: 0,
            description: 'Submit your content to be processed.',
            quotedStringSupport: true,
        });
    }
    async run(message) {
        const responses = {};
        for (const question of questions) {
            const savedData = message.author.settings[question.name];
            if (savedData) {
                responses[question.name] = savedData;
                continue;
            }
            const response = await this.ask(message, question.text);
            if (!response)
                return null;
            responses[question.name] = response.content;
        }
        const channel = message.guild.channels.get(submissionChannelID);
        if (!channel)
            return null;
        const responseEmbed = new discord_js_1.MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(message.member.displayName, message.author.displayAvatarURL())
            .setDescription(responses.authorName)
            .setFooter(responses.category)
            .setURL(responses.link)
            .setImage(responses.image)
            .setTitle(responses.title)
            .setTimestamp();
        const sentMessage = (await channel.send(responseEmbed));
        if (sentMessage)
            for (const reaction of REACTIONS.APPROVE_DENY)
                await sentMessage.react(reaction);
        const privateChannel = message.guild.channels.get(allowedChannels.find((c) => c.name === responses.category).id);
        if (privateChannel) {
            const sentPrivateMessage = (await privateChannel.send(responseEmbed));
            if (sentPrivateMessage)
                for (const reaction of REACTIONS.APPROVE_DENY)
                    await sentPrivateMessage.react(reaction);
        }
        return message.send('You have successfully sent in your submission. To view your submission please check out <#548555325956161547>');
    }
    async ask(message, question) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(message.member.displayName, message.author.displayAvatarURL())
            .setDescription(question)
            .setFooter('You have 5 minutes to reply.');
        await message.channel.send(embed);
        const messages = await message.channel.awaitMessages((response) => response.author === message.author, { time: 300000, max: 1 });
        if (messages.size === 0)
            return null;
        const responseMessage = messages.first();
        return responseMessage || null;
    }
}
exports.default = default_1;
