const { Message } = require('discord.js');
const Util = require('../../util/Util');
const DiscordClient = require('../../structures/DiscordClient');
const { ActiveQuests } = require('../../util/Games');
const Quests = require('../../util/Quests');

module.exports = {
    show: true,
    name: "quest",
    aliases: ["q"],
    description: "Complete a quest to earn monkey.",
    cooldown: 45,
    /**
     * @param {DiscordClient} client 
     * @param {Message} message 
     * @param {String[]} args 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
    async execute(client, message, args, config, profileData) {
        if (ActiveQuests.has(message.author.id)) {
            return message.reply(client.simpleEmbed(`You are already in a quest! [[Click Me To Go There]](${Util.createUrl(ActiveQuests.get(message.author.id).message)})`));
        }

        var quests = new Quests();
        var quest = quests[Math.floor(Math.random() * quests.length)];

        await Quests[quest](message);
    }
}