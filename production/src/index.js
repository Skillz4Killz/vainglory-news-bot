"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const klasa_1 = require("klasa");
const config_1 = require("../config");
klasa_1.KlasaClient.defaultUserSchema
    .add('authorName', 'string')
    .add('category', 'string');
new klasa_1.Client({
    commandEditing: true,
    prefix: '!',
    readyMessage: () => `Bot is Ready!`,
    typing: true,
}).login(config_1.default.botToken);
