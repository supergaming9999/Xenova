const { ApplicationCommandType, EmbedBuilder, CommandInteraction } = require('discord.js');
const DiscordClient = require('../../structures/DiscordClient');
const Util = require('../../util/Util');

module.exports = {
	name: 'ping',
	description: "Check bot's ping.",
	type: ApplicationCommandType.ChatInput,
	cooldown: 3000,
    /**
     * @param {DiscordClient} client 
     * @param {CommandInteraction} interaction 
     * @param {Util.configModel} config 
     * @param {Util.dbModel} profileData
     */
	run: async (client, interaction, config, profileData) => {
        var embed = new EmbedBuilder()
            .setColor('#2200ff')
            .setAuthor({
                name: `Average ping to API: ${Math.round(client.ws.ping)} ms`,
                iconURL: client.user.displayAvatarURL()
            });

		return interaction.reply({ embeds: [embed] });
	}
};