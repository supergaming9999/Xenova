const { ApplicationCommandType, CommandInteraction } = require('discord.js');
const Util = require('../../util/Util');
const DiscordClient = require('../../structures/DiscordClient');
const { ActiveQuests } = require('../../util/Games');
const Quests = require('../../util/Quests');

module.exports = {
	name: 'quest',
	description: "Complete a quest to earn monkey.",
	type: ApplicationCommandType.ChatInput,
	cooldown: 30,
    /**
     * @param {DiscordClient} client 
     * @param {CommandInteraction} interaction 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData 
     */
	run: async (client, interaction, config, profileData) => {
        if (ActiveQuests.has(interaction.user.id)) {
            return interaction.reply(client.simpleEmbed(`You are already in a quest! [[Click Me To Go There]](${Util.createUrl(ActiveQuests.get(interaction.user.id).message)})`));
        }

        var quests = Quests.list;
        var quest = quests[Math.floor(Math.random() * quests.length)];

        await Quests[quest]({
            author: interaction.user,
            reply: (...args) => interaction.reply(...args),
            channel: interaction.channel
        });
	}
};